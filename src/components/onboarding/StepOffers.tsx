import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Plus, Loader2, FileText, Trash2 } from "lucide-react";

export interface OfferEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
}

interface StepOffersProps {
  onNext: () => void;
  offers: OfferEntry[];
  onOffersChange: (offers: OfferEntry[]) => void;
  selectedOfferIds: Set<string>;
  onSelectedChange: (ids: Set<string>) => void;
}

function parsePaniersResponse(data: any): OfferEntry[] {
  const offers: OfferEntry[] = [];

  // Handle array wrapper: response can be [{ action, response: { output: { paniers } } }]
  let root = data;
  if (Array.isArray(root)) root = root[0];
  
  const paniers =
    root?.response?.output?.paniers ||
    root?.output?.paniers ||
    root?.paniers ||
    [];

  for (const panier of paniers) {
    const categoryName = (panier.nom || "autre").toLowerCase();
    const produits = panier.produits || [];
    for (const produit of produits) {
      offers.push({
        id: crypto.randomUUID(),
        name: typeof produit === "string" ? produit : produit.name || "",
        category: categoryName,
        description: "",
        price: null,
      });
    }
  }

  return offers;
}

const StepOffers: React.FC<StepOffersProps> = ({ onNext, offers, onOffersChange, selectedOfferIds, onSelectedChange }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);

      const res = await fetch("https://n8n.beautifulflow.ai/webhook/depot-offres", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();

      const extracted = parsePaniersResponse(data);

      if (extracted.length > 0) {
        const updated = [...offers, ...extracted];
        onOffersChange(updated);
        const newIds = new Set(selectedOfferIds);
        extracted.forEach(o => newIds.add(o.id));
        onSelectedChange(newIds);
        setFileName(file.name);
      }
    } catch (err) {
      console.error("Extraction error:", err);
    }
    setIsExtracting(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  }, [offers, selectedOfferIds]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const toggleOffer = (id: string) => {
    const next = new Set(selectedOfferIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onSelectedChange(next);
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

  // Group by category
  const categoryMap = new Map<string, OfferEntry[]>();
  for (const o of offers) {
    const cat = o.category || "autre";
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(o);
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Importe tes offres</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Uploade ton catalogue ou ajoute tes produits manuellement.
        </p>
      </div>

      {/* Upload zone with drag & drop */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.doc" className="hidden" onChange={handleFile} />
        {isExtracting ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Analyse de ton catalogue…</p>
            <p className="text-xs text-muted-foreground">Ça peut prendre jusqu'à 30 secondes</p>
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Glisse ou clique pour uploader</p>
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
      {Array.from(categoryMap.entries()).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground capitalize">{category}</h3>
          {items.map(offer => (
            <div key={offer.id} className="bg-card rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedOfferIds.has(offer.id)}
                  onCheckedChange={() => toggleOffer(offer.id)}
                />
                <span className="flex-1 text-sm text-foreground">
                  {offer.name || <span className="text-muted-foreground italic">Sans nom</span>}
                </span>
                <button onClick={() => removeOffer(offer.id)} className="text-muted-foreground hover:text-destructive">
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
        Ajouter un produit manuellement
      </Button>

      {/* Next */}
      <Button onClick={onNext} disabled={selectedOfferIds.size === 0} fullWidth size="lg">
        Continuer
      </Button>
    </div>
  );
};

export default StepOffers;
