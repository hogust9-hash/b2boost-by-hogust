import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Upload, Plus, Loader2, FileText, Trash2, ChevronDown, ChevronUp, FileUp, PenLine } from "lucide-react";
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
  const [mode, setMode] = useState<Mode>(offers.length > 0 ? "manual" : null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [customOffers, setCustomOffers] = useState<OfferEntry[]>([]);
  const [isSendingManual, setIsSendingManual] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pre-built offers as OfferEntry with stable IDs
  const [prebuiltOffers] = useState<OfferEntry[]>(() => {
    const all: OfferEntry[] = [];
    Object.entries(PREBUILT_CATALOG).forEach(([cat, items]) => {
      items.forEach(name => {
        all.push({
          id: `prebuilt-${cat}-${name}`,
          name,
          category: cat,
          description: "",
          price: null,
        });
      });
    });
    return all;
  });

  // Track selected prebuilt IDs and edited names
  const [selectedPrebuilt, setSelectedPrebuilt] = useState<Set<string>>(new Set());
  const [editedNames, setEditedNames] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // === DOCUMENT MODE ===
  const pollForOffers = (sid: string, uploadedFileName: string) => {
    pollingRef.current = setInterval(async () => {
      const { data, error } = await supabase
        .from("onboarding_offers")
        .select("*")
        .eq("session_id", sid);

      if (!error && data && data.length > 0) {
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

      fetch(WEBHOOK_DOC, { method: "POST", body: formData })
        .catch(err => console.error("Webhook error:", err));

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
  }, [sessionId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // === MANUAL MODE ===
  const toggleCategory = (cat: string) => {
    const next = new Set(expandedCategories);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setExpandedCategories(next);
  };

  const togglePrebuilt = (id: string) => {
    const next = new Set(selectedPrebuilt);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedPrebuilt(next);
  };

  const updatePrebuiltName = (id: string, newName: string) => {
    setEditedNames(prev => ({ ...prev, [id]: newName }));
  };

  const addCustomOffer = () => {
    const newOffer: OfferEntry = {
      id: crypto.randomUUID(),
      name: "",
      category: "custom",
      description: "",
      price: null,
    };
    setCustomOffers(prev => [...prev, newOffer]);
  };

  const updateCustomOffer = (id: string, name: string) => {
    setCustomOffers(prev => prev.map(o => o.id === id ? { ...o, name } : o));
  };

  const removeCustomOffer = (id: string) => {
    setCustomOffers(prev => prev.filter(o => o.id !== id));
  };

  const getManualOffers = (): OfferEntry[] => {
    const selected = prebuiltOffers
      .filter(o => selectedPrebuilt.has(o.id))
      .map(o => ({
        ...o,
        name: editedNames[o.id] ?? o.name,
      }));
    const custom = customOffers.filter(o => o.name.trim());
    return [...selected, ...custom];
  };

  const handleManualContinue = async () => {
    const manualOffers = getManualOffers();
    if (manualOffers.length === 0 || !sessionId) return;

    setIsSendingManual(true);

    try {
      // Save to Supabase
      for (const offer of manualOffers) {
        await supabase.from("onboarding_offers").insert({
          session_id: sessionId,
          name: offer.name,
          category: offer.category,
          description: offer.description,
          price: offer.price,
          is_selected: true,
        });
      }

      // Send to webhook
      const payload = {
        session_id: sessionId,
        bakery_name: bakeries[0]?.name || "",
        bakery_address: bakeries[0]?.address || "",
        bakery_city: bakeries[0]?.city || "",
        offers: manualOffers.map(o => ({ name: o.name, category: o.category })),
      };

      fetch(WEBHOOK_MANUAL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(err => console.error("Webhook manual error:", err));

      onOffersChange(manualOffers);
      const ids = new Set(manualOffers.map(o => o.id));
      onSelectedChange(ids);
      setIsSendingManual(false);
      onNext();
    } catch (err) {
      console.error("Manual submit error:", err);
      setIsSendingManual(false);
    }
  };

  // === DOCUMENT MODE: after offers loaded ===
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

  // Group doc offers by category
  const categoryMap = new Map<string, OfferEntry[]>();
  for (const o of offers) {
    const cat = o.category || "autre";
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(o);
  }

  const manualCount = selectedPrebuilt.size + customOffers.filter(o => o.name.trim()).length;

  // === MODE SELECTION ===
  if (mode === null) {
    return (
      <div className="space-y-6 px-4 py-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Importe tes offres</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Comment souhaites-tu ajouter tes offres ?
          </p>
        </div>

        <button
          onClick={() => setMode("document")}
          className="w-full bg-card rounded-xl border border-border p-5 flex items-center gap-4 hover:border-primary/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Importer un document</p>
            <p className="text-xs text-muted-foreground mt-0.5">PDF, Word ou fichier texte avec ton catalogue</p>
          </div>
        </button>

        <button
          onClick={() => setMode("manual")}
          className="w-full bg-card rounded-xl border border-border p-5 flex items-center gap-4 hover:border-primary/50 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <PenLine className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Importer manuellement</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sélectionne parmi nos offres types ou crée les tiennes</p>
          </div>
        </button>
      </div>
    );
  }

  // === DOCUMENT MODE ===
  if (mode === "document") {
    return (
      <div className="space-y-6 px-4 py-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Importe tes offres</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Uploade ton catalogue pour que nous analysions tes offres.
          </p>
        </div>

        {offers.length === 0 && (
          <>
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

            <Button variant="ghost" onClick={() => setMode(null)} fullWidth className="text-muted-foreground">
              ← Changer de méthode
            </Button>
          </>
        )}

        {fileName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{fileName}</span>
          </div>
        )}

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

        {offers.length > 0 && (
          <Button onClick={onNext} disabled={selectedOfferIds.size === 0} fullWidth size="lg">
            Continuer
          </Button>
        )}
      </div>
    );
  }

  // === MANUAL MODE ===
  return (
    <div className="space-y-5 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Importe tes offres</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sélectionne les offres que tu proposes ou ajoute les tiennes.
        </p>
      </div>

      {/* Pre-built categories */}
      {Object.entries(PREBUILT_CATALOG).map(([cat, items]) => {
        const isExpanded = expandedCategories.has(cat);
        const catOffers = prebuiltOffers.filter(o => o.category === cat);
        const selectedCount = catOffers.filter(o => selectedPrebuilt.has(o.id)).length;

        return (
          <div key={cat} className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{cat}</span>
                {selectedCount > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {selectedCount}
                  </span>
                )}
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-border divide-y divide-border">
                {catOffers.map(offer => (
                  <div key={offer.id} className="flex items-center gap-3 px-4 py-2.5">
                    <Checkbox
                      checked={selectedPrebuilt.has(offer.id)}
                      onCheckedChange={() => togglePrebuilt(offer.id)}
                    />
                    <Input
                      value={editedNames[offer.id] ?? offer.name}
                      onChange={(e) => updatePrebuiltName(offer.id, e.target.value)}
                      className="h-8 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 shadow-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Custom offers */}
      {customOffers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Mes offres personnalisées</h3>
          {customOffers.map(offer => (
            <div key={offer.id} className="flex items-center gap-2 bg-card rounded-lg border border-border px-3 py-2">
              <Input
                value={offer.name}
                onChange={(e) => updateCustomOffer(offer.id, e.target.value)}
                placeholder="Nom de l'offre"
                className="h-8 text-sm flex-1 border-0 bg-transparent px-0 focus-visible:ring-0 shadow-none"
              />
              <button onClick={() => removeCustomOffer(offer.id)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" onClick={addCustomOffer} fullWidth>
        <Plus className="h-4 w-4" />
        Ajouter une offre personnalisée
      </Button>

      <Button variant="ghost" onClick={() => setMode(null)} fullWidth className="text-muted-foreground">
        ← Changer de méthode
      </Button>

      <Button
        onClick={handleManualContinue}
        disabled={manualCount === 0 || isSendingManual}
        fullWidth
        size="lg"
      >
        {isSendingManual ? <Loader2 className="h-4 w-4 animate-spin" /> : `Continuer avec ${manualCount} offre${manualCount > 1 ? "s" : ""}`}
      </Button>
    </div>
  );
};

export default StepOffers;
