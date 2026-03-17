import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MapPin, Package, Mail, Users, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { OfferEntry } from "./StepOffers";
import type { MessageEntry } from "./StepMessages";

interface BakeryEntry {
  name: string;
  address: string;
  city: string;
}

interface Category {
  id: string;
  name: string;
  icon_name: string | null;
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
  messages: MessageEntry[];
  targetCategoryId: string;
  onTargetCategoryChange: (id: string) => void;
  sessionId: string | null;
}

const StepCampaignRecap: React.FC<StepCampaignRecapProps> = ({
  onNext, bakeries, offers, selectedOfferIds, messages,
  targetCategoryId, onTargetCategoryChange, sessionId,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ProspectStats | null>(null);

  useEffect(() => {
    supabase.from("prospect_categories").select("*").then(({ data }) => {
      if (data) setCategories(data);
      if (data && data.length > 0 && !targetCategoryId) {
        onTargetCategoryChange(data[0].id);
      }
    });
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
        setStats({
          total_cibles: data.total_cibles,
          total_cibles_adressables: data.total_cibles_adressables,
          categories: data.categories as Record<string, number> | null,
        });
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

  const activeOffers = offers.filter(o => selectedOfferIds.has(o.id));

  // Sort categories by count descending for visual ranking
  const sortedCategories = stats?.categories
    ? Object.entries(stats.categories).sort(([, a], [, b]) => b - a)
    : [];
  const maxCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Récap de ta campagne</h2>
        <p className="text-sm text-muted-foreground mt-1">Vérifie les paramètres avant de continuer.</p>
      </div>

      {!stats ? (
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground text-center">Analyse de ton marché en cours…</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Target className="h-4 w-4 text-primary" />
            Potentiel de prospection
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-background rounded-lg p-3 text-center border border-border">
              <p className="text-2xl font-bold text-foreground">{stats.total_cibles ? Number(stats.total_cibles).toLocaleString("fr-FR") : "–"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">cibles identifiées</p>
            </div>
            <div className="flex-1 bg-primary/5 rounded-lg p-3 text-center border border-primary/20">
              <p className="text-2xl font-bold text-primary">{stats.total_cibles_adressables ? `~${Number(stats.total_cibles_adressables).toLocaleString("fr-FR")}` : "–"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">cibles adressables (est.)</p>
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

      {/* Bakeries */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Boulangerie{bakeries.length > 1 ? "s" : ""}
        </div>
        {bakeries.map((b, i) => (
          <p key={i} className="text-sm text-muted-foreground ml-6">{b.name} — {b.city}</p>
        ))}
      </div>



      {/* Active offers */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Package className="h-4 w-4 text-primary" />
          {activeOffers.length} offre{activeOffers.length > 1 ? "s" : ""} active{activeOffers.length > 1 ? "s" : ""}
        </div>
        {activeOffers.map(o => (
          <p key={o.id} className="text-sm text-muted-foreground ml-6">
            {o.name}{o.price ? ` — ${o.price.toFixed(2)} €` : ""}
          </p>
        ))}
      </div>

      {/* Messages preview */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Mail className="h-4 w-4 text-primary" />
          Séquence de 3 messages
        </div>
        {messages.map((m, i) => (
          <p key={i} className="text-sm text-muted-foreground ml-6 truncate">
            {i + 1}. {m.subject}
          </p>
        ))}
      </div>

      <Button onClick={onNext} fullWidth size="lg">
        Choisir mon rythme de prospection
      </Button>
    </div>
  );
};

export default StepCampaignRecap;
