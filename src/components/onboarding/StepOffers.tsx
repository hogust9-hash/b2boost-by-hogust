import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Plus, Loader2, FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface OfferEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
}

const CATEGORIES = ["snacking", "viennoiserie", "pâtisserie", "traiteur", "pain", "autre"];

interface StepOffersProps {
  onNext: () => void;
  offers: OfferEntry[];
  onOffersChange: (offers: OfferEntry[]) => void;
  selectedOfferIds: Set<string>;
  onSelectedChange: (ids: Set<string>) => void;
}

const StepOffers: React.FC<StepOffersProps> = ({ onNext, offers, onOffersChange, selectedOfferIds, onSelectedChange }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsExtracting(true);

    try {
      let content = "";
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        content = await file.text();
      } else {
        // For PDF/Word, read as base64 and send to edge function
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        bytes.forEach(b => binary += String.fromCharCode(b));
        content = btoa(binary);
      }

      const { data, error } = await supabase.functions.invoke("extract-offers", {
        body: { content, filename: file.name },
      });

      if (error) throw error;

      const extracted: OfferEntry[] = (data.offers || []).map((o: any) => ({
        id: crypto.randomUUID(),
        name: o.name,
        category: o.category || "autre",
        description: o.description || "",
        price: o.price ?? null,
      }));

      const updated = [...offers, ...extracted];
      onOffersChange(updated);
      // Select all new ones
      const newIds = new Set(selectedOfferIds);
      extracted.forEach(o => newIds.add(o.id));
      onSelectedChange(newIds);
    } catch (err) {
      console.error("Extraction error:", err);
    }
    setIsExtracting(false);
  };

  const toggleOffer = (id: string) => {
    const next = new Set(selectedOfferIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onSelectedChange(next);
  };

  const updateOffer = (id: string, field: keyof OfferEntry, value: string | number | null) => {
    onOffersChange(offers.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const removeOffer = (id: string) => {
    onOffersChange(offers.filter(o => o.id !== id));
    const next = new Set(selectedOfferIds);
    next.delete(id);
    onSelectedChange(next);
  };

  const addManualOffer = () => {
    const newOffer: OfferEntry = {
      id: crypto.randomUUID(),
      name: "",
      category: "autre",
      description: "",
      price: null,
    };
    onOffersChange([...offers, newOffer]);
    const next = new Set(selectedOfferIds);
    next.add(newOffer.id);
    onSelectedChange(next);
  };

  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    items: offers.filter(o => o.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Importe tes offres</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Uploade ton catalogue ou ajoute tes paniers manuellement.
        </p>
      </div>

      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.doc" className="hidden" onChange={handleFile} />
        {isExtracting ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Extraction en cours…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Glissez ou cliquez pour uploader</p>
            <p className="text-xs text-muted-foreground">PDF, Word ou texte brut</p>
          </div>
        )}
      </div>

      {fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{fileName}</span>
        </div>
      )}

      {/* Offers grouped by category */}
      {grouped.map(({ category, items }) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground capitalize">{category}</h3>
          {items.map(offer => (
            <div key={offer.id} className="bg-card rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedOfferIds.has(offer.id)}
                  onCheckedChange={() => toggleOffer(offer.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <Input
                    value={offer.name}
                    onChange={e => updateOffer(offer.id, "name", e.target.value)}
                    placeholder="Nom de l'offre"
                    className="h-9 text-sm"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={offer.description}
                      onChange={e => updateOffer(offer.id, "description", e.target.value)}
                      placeholder="Description"
                      className="h-9 text-sm flex-1"
                    />
                    <Input
                      type="number"
                      value={offer.price ?? ""}
                      onChange={e => updateOffer(offer.id, "price", e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Prix €"
                      className="h-9 text-sm w-24"
                    />
                  </div>
                  <select
                    value={offer.category}
                    onChange={e => updateOffer(offer.id, "category", e.target.value)}
                    className="text-xs rounded border border-border bg-background px-2 py-1"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={() => removeOffer(offer.id)} className="text-muted-foreground hover:text-destructive mt-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Add manual */}
      <Button variant="outline" onClick={addManualOffer} fullWidth>
        <Plus className="h-4 w-4" />
        Ajouter une offre manuellement
      </Button>

      {/* Next */}
      <Button onClick={onNext} disabled={selectedOfferIds.size === 0} fullWidth size="lg">
        Continuer
      </Button>
    </div>
  );
};

export default StepOffers;
