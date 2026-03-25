import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, FileText, Plus, X, Pencil, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface OfferEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
}

// Editable category header
const CategoryHeader: React.FC<{
  category: string;
  count: number;
  offers: OfferEntry[];
  onOffersChange: (offers: OfferEntry[]) => void;
}> = ({ category, count, offers, onOffersChange }) => {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(category);

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== category) {
      const updated = offers.map(o =>
        o.category === category ? { ...o, category: newName.trim() } : o
      );
      onOffersChange(updated);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
          className="h-8 text-sm font-semibold"
          autoFocus
        />
        <button onClick={handleRename} className="text-primary hover:text-primary/80">
          <Check className="h-4 w-4" />
        </button>
        <button onClick={() => { setEditing(false); setNewName(category); }} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-semibold text-foreground capitalize">{category.toLowerCase()}</h3>
        <button onClick={() => { setNewName(category); setEditing(true); }} className="text-muted-foreground hover:text-foreground">
          <Pencil className="h-3 w-3" />
        </button>
      </div>
      <span className="text-xs text-muted-foreground">{count} produit{count > 1 ? "s" : ""}</span>
    </div>
  );
};

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
const WEBHOOK_REDACTION = "https://n8n.beautifulflow.ai/webhook/redaction-messages";

const CATEGORY_OPTIONS = [
  "snacking",
  "viennoiserie",
  "pâtisserie",
  "traiteur",
  "boulangerie",
  "autre",
];

// Build a unique key for each individual product
const productKey = (offerId: string, idx: number) => `${offerId}-${idx}`;

const StepOffers: React.FC<StepOffersProps> = ({ onNext, offers, onOffersChange, selectedOfferIds, onSelectedChange, sessionId, bakeries }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("autre");
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
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
        // Select all individual products by default
        const newIds = new Set<string>();
        for (const o of extracted) {
          const desc = o.description?.trim();
          if (desc) {
            const parts = desc.split(",").map(p => p.trim()).filter(p => p.length > 0);
            parts.forEach((_, idx) => newIds.add(productKey(o.id, idx)));
          } else {
            newIds.add(productKey(o.id, 0));
          }
        }
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
      pollForOffers(sessionId, file.name);
    } catch (err) {
      console.error("Upload error:", err);
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

  const toggleProduct = (key: string) => {
    const next = new Set(selectedOfferIds);
    if (next.has(key)) next.delete(key); else next.add(key);
    onSelectedChange(next);
  };

  const addManualProduct = async () => {
    if (!newProductName.trim() || !sessionId) return;

    // Insert into onboarding_offers table
    const { data, error } = await supabase
      .from("onboarding_offers")
      .insert({
        session_id: sessionId,
        name: newProductCategory,
        category: newProductCategory,
        description: newProductName.trim(),
        is_selected: true,
      })
      .select()
      .single();

    if (data && !error) {
      const newOffer: OfferEntry = {
        id: data.id,
        name: data.name || "",
        category: data.category || "autre",
        description: data.description || "",
        price: null,
      };
      const updatedOffers = [...offers, newOffer];
      onOffersChange(updatedOffers);

      const next = new Set(selectedOfferIds);
      next.add(productKey(data.id, 0));
      onSelectedChange(next);
    }

    setNewProductName("");
    setNewProductCategory("autre");
    setShowAddForm(false);
  };

  // Build product list with individual keys
  const allProducts: { key: string; offerId: string; productName: string; category: string }[] = [];
  const categoryMap = new Map<string, typeof allProducts>();

  for (const offer of offers) {
    const cat = offer.category || "autre";
    const desc = offer.description?.trim();
    if (desc) {
      const parts = desc.split(",").map(p => p.trim()).filter(p => p.length > 0);
      for (let idx = 0; idx < parts.length; idx++) {
        const key = productKey(offer.id, idx);
        const product = { key, offerId: offer.id, productName: parts[idx], category: cat };
        allProducts.push(product);
        if (!categoryMap.has(cat)) categoryMap.set(cat, []);
        categoryMap.get(cat)!.push(product);
      }
    } else {
      const key = productKey(offer.id, 0);
      const product = { key, offerId: offer.id, productName: offer.name, category: cat };
      allProducts.push(product);
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(product);
    }
  }

  const handleContinue = async () => {
    if (!sessionId) return;
    setIsSendingWebhook(true);

    // Collect selected product names
    const selectedProducts = allProducts
      .filter(p => selectedOfferIds.has(p.key))
      .map(p => ({ name: p.productName, category: p.category }));

    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("offers", JSON.stringify(selectedProducts));
      if (bakeries.length > 0) {
        formData.append("bakery_name", bakeries[0].name);
        formData.append("bakery_address", bakeries[0].address);
        formData.append("bakery_city", bakeries[0].city);
      }

      await fetch(WEBHOOK_REDACTION, { method: "POST", body: formData });
    } catch (err) {
      console.error("Webhook redaction error:", err);
    }

    setIsSendingWebhook(false);
    onNext();
  };

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

      {Array.from(categoryMap.entries()).map(([category, products]) => (
      <div key={category} className="space-y-2">
          <CategoryHeader
            category={category}
            count={products.length}
            offers={offers}
            onOffersChange={onOffersChange}
          />
          {products.map((product) => (
            <div key={product.key} className="bg-card rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedOfferIds.has(product.key)}
                  onCheckedChange={() => toggleProduct(product.key)}
                />
                <span className="flex-1 text-sm text-foreground">{product.productName}</span>
              </div>
            </div>
          ))}
        </div>
      ))}

      {offers.length > 0 && (
        <>
          {showAddForm ? (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Ajouter un produit</p>
                <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Input
                placeholder="Nom du produit"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
              <select
                className="w-full h-12 rounded-lg border border-border bg-card px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={newProductCategory}
                onChange={(e) => setNewProductCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <Button onClick={addManualProduct} disabled={!newProductName.trim()} fullWidth>
                Ajouter
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowAddForm(true)} fullWidth>
              <Plus className="h-4 w-4" />
              Ajouter une offre
            </Button>
          )}

          <Button onClick={handleContinue} disabled={selectedOfferIds.size === 0 || isSendingWebhook} fullWidth size="lg">
            {isSendingWebhook ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continuer"}
          </Button>
        </>
      )}
    </div>
  );
};

export default StepOffers;
