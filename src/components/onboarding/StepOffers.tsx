import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

interface StepOffersProps {
  onNext: () => void;
  offers: OfferEntry[];
  onOffersChange: (offers: OfferEntry[]) => void;
  selectedOfferIds: Set<string>;
  onSelectedChange: (ids: Set<string>) => void;
  sessionId: string | null;
}

const StepOffers: React.FC<StepOffersProps> = ({ onNext, offers, onOffersChange, selectedOfferIds, onSelectedChange, sessionId }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const pollForOffers = (sid: string, uploadedFileName: string) => {
    pollingRef.current = setInterval(async () => {
      const { data, error } = await supabase
        .from("onboarding_offers")
        .select("*")
        .eq("session_id", sid);

      if (!error && data && data.length > 0) {
        // Offers are ready
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;

        const extracted: OfferEntry[] = data.map(o => ({
          id: o.id,
          name: o.name || "",
          category: o.category || "autre",
          description: o.description || "",
          price: o.price ? Number(o.price) : null,
        }));

        const updated = [...offers, ...extracted];
        onOffersChange(updated);
        const newIds = new Set(selectedOfferIds);
        extracted.forEach(o => newIds.add(o.id));
        onSelectedChange(newIds);
        setFileName(uploadedFileName);
        setIsExtracting(false);
      }
    }, 3000); // Poll every 3 seconds
  };

  const processFile = async (file: File) => {
    if (!sessionId) return;
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);
      formData.append("session_id", sessionId);

      // Fire and forget — n8n will process and write to Supabase
      fetch("https://n8n.beautifulflow.ai/webhook/depot-offres", {
        method: "POST",
        body: formData,
      }).catch(err => console.error("Webhook error:", err));

      // Start polling Supabase for results
      pollForOffers(sessionId, file.name);
    } catch (err) {
      console.error("Upload error:", err);
      setIsExtracting(false);
    }
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
  }, [sessionId, offers, selectedOfferIds]);

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

    // Sync selection to Supabase
    supabase
      .from("onboarding_offers")
      .update({ is_selected: next.has(id) })
      .eq("id", id)
      .then(() => {});
  };

  const removeOffer = (id: string) => {
    onOffersChange(offers.filter(o => o.id !== id));
    const next = new Set(selectedOfferIds);
    next.delete(id);
    onSelectedChange(next);
  };

  const addManualOffer = async () => {
    const newOffer: OfferEntry = {
      id: crypto.randomUUID(),
      name: "",
      category: "autre",
      description: "",
      price: null,
    };

    // Insert into Supabase if session exists
    if (sessionId) {
      const { data } = await supabase
        .from("onboarding_offers")
        .insert({
          session_id: sessionId,
          name: "",
          category: "autre",
          description: "",
          price: null,
          is_selected: true,
        })
        .select("id")
        .single();
      if (data) newOffer.id = data.id;
    }

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
          Uploade ton catalogue ou ajoute tes offres manuellement.
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
              <div className="h-full bg-primary rounded-full animate-[progress_30s_ease-in-out_forwards]" />
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
