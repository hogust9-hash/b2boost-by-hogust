import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OfferEntry } from "./StepOffers";

const CATEGORIES = ["snacking", "viennoiserie", "pâtisserie", "traiteur", "pain", "autre"];

interface StepValidateOffersProps {
  onNext: () => void;
  offers: OfferEntry[];
  selectedOfferIds: Set<string>;
  onOffersChange: (offers: OfferEntry[]) => void;
}

const StepValidateOffers: React.FC<StepValidateOffersProps> = ({ onNext, offers, selectedOfferIds, onOffersChange }) => {
  const activeOffers = offers.filter(o => selectedOfferIds.has(o.id));

  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    items: activeOffers.filter(o => o.category === cat),
  })).filter(g => g.items.length > 0);

  const updateOffer = (id: string, field: keyof OfferEntry, value: string | number | null) => {
    onOffersChange(offers.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Validez vos offres</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {activeOffers.length} offre{activeOffers.length > 1 ? "s" : ""} sélectionnée{activeOffers.length > 1 ? "s" : ""} — ajustez si besoin.
        </p>
      </div>

      {grouped.map(({ category, items }) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground capitalize">{category}</h3>
          {items.map(offer => (
            <div key={offer.id} className="bg-card rounded-lg border border-border p-3 space-y-2">
              <Input
                value={offer.name}
                onChange={e => updateOffer(offer.id, "name", e.target.value)}
                className="h-9 text-sm font-medium"
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
            </div>
          ))}
        </div>
      ))}

      <Button onClick={onNext} fullWidth size="lg">
        Valider et continuer
      </Button>
    </div>
  );
};

export default StepValidateOffers;
