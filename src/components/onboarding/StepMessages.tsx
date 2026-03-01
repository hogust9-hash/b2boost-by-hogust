import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { OfferEntry } from "./StepOffers";

export interface MessageEntry {
  subject: string;
  body: string;
}

interface BakeryEntry {
  name: string;
  city: string;
}

interface StepMessagesProps {
  onNext: () => void;
  messages: MessageEntry[];
  onMessagesChange: (messages: MessageEntry[]) => void;
  bakeries: BakeryEntry[];
  offers: OfferEntry[];
  selectedOfferIds: Set<string>;
}

const MESSAGE_LABELS = [
  { label: "Message 1 — Découverte", color: "bg-primary/10 text-primary" },
  { label: "Message 2 — Relance", color: "bg-amber-100 text-amber-700" },
  { label: "Message 3 — Dernière chance", color: "bg-red-100 text-red-700" },
];

export function generateMessages(bakeries: BakeryEntry[], offers: OfferEntry[], selectedOfferIds: Set<string>): MessageEntry[] {
  const bakery = bakeries[0] || { name: "Votre boulangerie", city: "votre ville" };
  const activeOffers = offers.filter(o => selectedOfferIds.has(o.id));
  const topOffer = activeOffers[0]?.name || "nos créations artisanales";

  return [
    {
      subject: `Découvrez les créations artisanales de ${bakery.name}`,
      body: `Bonjour,\n\nNous sommes ${bakery.name}, artisan boulanger à ${bakery.city}. Nous proposons ${topOffer} et bien d'autres spécialités préparées chaque jour avec passion.\n\nSeriez-vous intéressé(e) par un partenariat gourmand de proximité ?\n\nÀ très vite,\nL'équipe ${bakery.name}`,
    },
    {
      subject: `Un partenariat local qui a du goût !`,
      body: `Bonjour,\n\nSuite à notre précédent message, nous voulions vous rappeler que ${bakery.name} est juste à côté ! Nos ${activeOffers.length} offres sont pensées pour les professionnels comme vous.\n\nUn café et une dégustation, ça vous dit ? 😊\n\nBien à vous,\n${bakery.name}`,
    },
    {
      subject: `Dernière occasion de goûter à nos offres`,
      body: `Bonjour,\n\nC'est notre dernier message — on ne veut pas être insistants ! Mais si l'idée d'un approvisionnement artisanal et local vous séduit, on serait ravis d'en discuter.\n\nFierté locale, qualité artisanale — c'est notre ADN.\n\nL'équipe ${bakery.name} 🥖`,
    },
  ];
}

const StepMessages: React.FC<StepMessagesProps> = ({ onNext, messages, onMessagesChange, bakeries, offers, selectedOfferIds }) => {
  const updateMessage = (index: number, field: keyof MessageEntry, value: string) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], [field]: value };
    onMessagesChange(updated);
  };

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Séquence de prospection</h2>
        <p className="text-sm text-muted-foreground mt-1">3 messages auto-générés — personnalisez-les à votre guise.</p>
      </div>

      {messages.map((msg, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${MESSAGE_LABELS[i].color}`}>
              {MESSAGE_LABELS[i].label}
            </span>
            <Badge variant="outline" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" /> auto-généré
            </Badge>
          </div>
          <Input
            value={msg.subject}
            onChange={e => updateMessage(i, "subject", e.target.value)}
            placeholder="Sujet du message"
            className="text-sm font-medium"
          />
          <Textarea
            value={msg.body}
            onChange={e => updateMessage(i, "body", e.target.value)}
            rows={6}
            className="text-sm"
          />
        </div>
      ))}

      <Button onClick={onNext} fullWidth size="lg">
        Continuer
      </Button>
    </div>
  );
};

export default StepMessages;
