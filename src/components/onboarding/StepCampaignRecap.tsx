import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Mail, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { OfferEntry } from "./StepOffers";
import type { MessageEntry } from "./StepMessages";

interface BakeryEntry {
  name: string;
  city: string;
}

interface Category {
  id: string;
  name: string;
  icon_name: string | null;
}

interface StepCampaignRecapProps {
  onNext: () => void;
  bakeries: BakeryEntry[];
  offers: OfferEntry[];
  selectedOfferIds: Set<string>;
  messages: MessageEntry[];
  targetCategoryId: string;
  onTargetCategoryChange: (id: string) => void;
}

const StepCampaignRecap: React.FC<StepCampaignRecapProps> = ({
  onNext, bakeries, offers, selectedOfferIds, messages,
  targetCategoryId, onTargetCategoryChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from("prospect_categories").select("*").then(({ data }) => {
      if (data) setCategories(data);
      if (data && data.length > 0 && !targetCategoryId) {
        onTargetCategoryChange(data[0].id);
      }
    });
  }, []);

  const activeOffers = offers.filter(o => selectedOfferIds.has(o.id));

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Récap de ta campagne</h2>
        <p className="text-sm text-muted-foreground mt-1">Vérifie les paramètres avant de continuer.</p>
      </div>

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

      {/* Target category */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Users className="h-4 w-4 text-primary" />
          Catégorie cible
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onTargetCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                targetCategoryId === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
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
