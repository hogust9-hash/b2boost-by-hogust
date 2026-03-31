import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Package, Target, Mail } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import type { OfferEntry } from "./StepOffers";

interface BakeryEntry {
  name: string;
  address: string;
  city: string;
}

interface ProspectStats {
  total_cibles: string | null;
  total_cibles_adressables: string | null;
  categories: Record<string, number> | null;
}

interface StepCampaignRecapProps {
  onNext: () => void;
  bakeries: BakeryEntry[];
  offers: OfferEntry[];
  selectedOfferIds: Set<string>;
  targetCategoryId: string;
  onTargetCategoryChange: (id: string) => void;
  sessionId: string | null;
  onProspectCountChange?: (count: number) => void;
}

const SEQUENCE_STEPS = [
  { day: 0, label: "Premier contact" },
  { day: 3, label: "Relance 1" },
  { day: 8, label: "Relance 2" },
  { day: 17, label: "Relance 3" },
  { day: 30, label: "Clôture" },
];

const StepCampaignRecap: React.FC<StepCampaignRecapProps> = ({
  onNext, bakeries, offers, selectedOfferIds,
  targetCategoryId, onTargetCategoryChange, sessionId, onProspectCountChange
}) => {
  const [stats, setStats] = useState<ProspectStats | null>(null);

  useEffect(() => {
    if (!targetCategoryId) {
      supabase.from("prospect_categories").select("*").then(({ data }) => {
        if (data && data.length > 0) onTargetCategoryChange(data[0].id);
      });
    }
  }, []);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const fetchStats = async () => {
      const { data } = await supabase
        .from("onboarding_prospect_stats")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        const adressables = data.total_cibles_adressables ? Number(data.total_cibles_adressables) : 0;
        setStats({
          total_cibles: data.total_cibles,
          total_cibles_adressables: data.total_cibles_adressables,
          categories: data.categories as Record<string, number> | null,
        });
        onProspectCountChange?.(adressables);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    };
    fetchStats();
    if (!stats) {
      pollingRef.current = setInterval(fetchStats, 3000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [sessionId]);

  const selectedProducts = offers
    .flatMap((offer) => {
      const category = offer.category || "autre";
      const description = offer.description?.trim();
      const productNames = description
        ? description.split(",").map((part) => part.trim()).filter(Boolean)
        : [offer.name].filter(Boolean);
      return productNames.map((productName, index) => ({
        key: `${offer.id}-${index}`,
        name: productName,
        category,
        price: offer.price,
      }));
    })
    .filter((product) => selectedOfferIds.has(product.key));

  const selectedProductsByCategory = Object.entries(
    selectedProducts.reduce<Record<string, typeof selectedProducts>>((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b, "fr"));

  const sortedCategories = stats?.categories
    ? Object.entries(stats.categories).sort(([, a], [, b]) => b - a)
    : [];
  const maxCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <div className="space-y-5 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Récap de ta campagne</h2>
      </div>

      {/* Bakery — first */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Boulangerie{bakeries.length > 1 ? "s" : ""}
        </div>
        {bakeries.map((b, i) => (
          <div key={i} className="ml-6">
            <p className="text-sm font-medium text-foreground">{b.name}</p>
            <p className="text-xs text-muted-foreground">{b.address}</p>
          </div>
        ))}
      </div>

      {/* Prospect stats */}
      {!stats ? (
        <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground text-center">Analyse de ton marché en cours…</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Target className="h-4 w-4 text-primary" />
            Potentiel de prospection
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-background rounded-xl p-3 text-center border border-border">
              <p className="text-2xl font-bold text-foreground">
                {stats.total_cibles ? Number(stats.total_cibles).toLocaleString("fr-FR") : "–"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">cibles identifiées</p>
            </div>
            <div className="flex-1 bg-primary/5 rounded-xl p-3 text-center border border-primary/20">
              <p className="text-2xl font-bold text-primary">
                {stats.total_cibles_adressables
                  ? `environ ${Number(stats.total_cibles_adressables).toLocaleString("fr-FR")}`
                  : "–"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">cibles adressables (estimation)</p>
            </div>
          </div>
          {sortedCategories.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">Répartition par secteur</p>
              {sortedCategories.map(([name, count]) => {
                const ratio = count / maxCount;
                return (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-[140px] truncate shrink-0">{name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full transition-all"
                        style={{ width: `${Math.max(ratio * 100, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected offers with visible scrollbar */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Package className="h-4 w-4 text-primary" />
            Offres sélectionnées
          </div>
          <span className="text-xs text-muted-foreground">
            {selectedProducts.length} produit{selectedProducts.length > 1 ? "s" : ""}
          </span>
        </div>
        {selectedProducts.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune offre sélectionnée à l'étape d'import.</p>
        ) : (
          <ScrollArea className="max-h-48">
            <div className="space-y-3 pr-3">
              {selectedProductsByCategory.map(([category, products]) => (
                <div key={category} className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground capitalize">
                    {category} ({products.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {products.map((product) => (
                      <span
                        key={product.key}
                        className="inline-flex items-center gap-1 text-xs bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground"
                      >
                        {product.name}
                        {product.price != null && (
                          <span className="text-primary font-medium">{product.price.toFixed(2)}€</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Prospection sequence timeline — badges only for delays */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Mail className="h-4 w-4 text-primary" />
          Séquence de prospection
        </div>
        <p className="text-xs text-muted-foreground">
          Un cycle sur <strong>3 semaines</strong> : un premier email suivi de relances espacées pour créer du lien et marquer les esprits.
        </p>

        <div className="relative ml-3">
          <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-primary/60 via-primary/30 to-primary/10 rounded-full" />

          <div className="space-y-0">
            {SEQUENCE_STEPS.map((item, i) => {
              if ("delay" in item) {
                return (
                  <div key={i} className="flex items-center gap-3 py-1.5 pl-0">
                    <div className="relative z-10 w-4 h-4" />
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                      {item.delay}
                    </span>
                  </div>
                );
              }

              const stepIndex = SEQUENCE_STEPS.filter((s, si) => si <= i && "label" in s).length;
              return (
                <div key={i} className="flex items-center gap-3 py-2 pl-0">
                  <div className="relative z-10 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold shadow-sm">
                    {stepIndex}
                  </div>
                  <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 flex-1">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Button onClick={onNext} fullWidth size="lg">
        Choisir mon rythme de prospection
      </Button>
    </div>
  );
};

export default StepCampaignRecap;
