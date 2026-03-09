import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Loader2, FileText, Trash2 } from "lucide-react";
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
  bakeries: { name: string; address: string; city: string }[];
}

const WEBHOOK_DOC = "https://n8n.beautifulflow.ai/webhook/depot-offres-doc";

const StepOffers: React.FC<StepOffersProps> = ({ onNext, offers, onOffersChange, selectedOfferIds, onSelectedChange, sessionId, bakeries }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const lastCountRef = useRef(0);
  const stableTicksRef = useRef(0);

  const pollForOffers = (sid: string, uploadedFileName: string) => {
    lastCountRef.current = 0;
    stableTicksRef.current = 0;

    pollingRef.current = setInterval(async () => {
      const { data, error } = await supabase
        .from("onboarding_offers")
        .select("*")
        .eq("session_id", sid);

      if (error || !data) return;

      const count = data.length;
      if (count > 0 && count === lastCountRef.current) {
        stableTicksRef.current++;
      } else {
        stableTicksRef.current = 0;
      }
      lastCountRef.current = count;

      // Wait until count is stable for 2 consecutive ticks (6s)
      if (count > 0 && stableTicksRef.current >= 2) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;

        const extracted: OfferEntry[] = data.map(o => ({
          id: o.id,
          name: o.name || "",
          category: o.category || "autre",
          description: o.description || "",
          price: o.price ? Number(o.price) : null,
        }));

        onOffersChange(extracted);
        const newIds = new Set<string>();
        extracted.forEach(o => newIds.add(o.id));
        onSelectedChange(newIds);
        setFileName(uploadedFileName);
        setIsExtracting(false);
      }
    }, 3000);
  };

  const processFile = async (file: File) => {
    if (!sessionId) return;
    setIsExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", file.name);
      formData.append("session_id", sessionId);
      if (bakeries.length > 0) {
        formData.append("bakery_name", bakeries[0].name);
        formData.append("bakery_address", bakeries[0].address);
        formData.append("bakery_city", bakeries[0].city);
      }

      await fetch(WEBHOOK_DOC, { method: "POST", body: formData });

      // n8n writes offers to DB — poll until they appear
      pollForOffers(sessionId, file.name);
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback: poll for offers written by n8n
      pollForOffers(sessionId, file.name);
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
  }, [sessionId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const toggleOffer = (id: string) => {
    const next = new Set(selectedOfferIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onSelectedChange(next);

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

  // Group offers by category
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
          Uploade ton catalogue pour que nous analysions tes offres.
        </p>
      </div>

      {offers.length === 0 && (
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
              <p className="text-xs text-muted-foreground">PDF, Word ou texte brut (1 fichier max)</p>
            </div>
          )}
        </div>
      )}

      {fileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{fileName}</span>
        </div>
      )}

      {Array.from(categoryMap.entries()).map(([category, items]) => {
        // Each item may contain multiple products in the description field (comma-separated)
        const products: { offerId: string; productName: string }[] = [];
        for (const offer of items) {
          const desc = offer.description?.trim();
          if (desc) {
            // Products are comma-separated in the description
            const parts = desc.split(",").map(p => p.trim()).filter(p => p.length > 0);
            for (const part of parts) {
              products.push({ offerId: offer.id, productName: part });
            }
          } else {
            // Fallback: use the offer name itself if no description
            products.push({ offerId: offer.id, productName: offer.name });
          }
        }

        return (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground capitalize">{category.toLowerCase()}</h3>
              <span className="text-xs text-muted-foreground">{products.length} produit{products.length > 1 ? "s" : ""}</span>
            </div>
            {products.map((product, idx) => (
              <div key={`${product.offerId}-${idx}`} className="bg-card rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedOfferIds.has(product.offerId)}
                    onCheckedChange={() => toggleOffer(product.offerId)}
                  />
                  <span className="flex-1 text-sm text-foreground">{product.productName}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {offers.length > 0 && (
        <Button onClick={onNext} disabled={selectedOfferIds.size === 0} fullWidth size="lg">
          Continuer
        </Button>
      )}
    </div>
  );
};

export default StepOffers;
