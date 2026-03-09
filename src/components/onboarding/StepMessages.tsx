import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
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

export async function fetchMessages(
  bakeries: BakeryEntry[],
  offers: OfferEntry[],
  selectedOfferIds: Set<string>,
  feedback?: string,
): Promise<MessageEntry[]> {
  const activeOffers = offers.filter(o => selectedOfferIds.has(o.id));
  const res = await fetch("https://n8n.beautifulflow.ai/webhook/exemples-messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bakeries: bakeries.map(b => ({ name: b.name, city: b.city })),
      offers: activeOffers.map(o => ({ name: o.name, category: o.category, description: o.description, price: o.price })),
      feedback: feedback || undefined,
    }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  const data = await res.json();
  return (data.messages || []).slice(0, 3).map((m: any) => ({
    subject: m.subject || "",
    body: m.body || "",
  }));
}

const StepMessages: React.FC<StepMessagesProps> = ({ onNext, messages, onMessagesChange, bakeries, offers, selectedOfferIds }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleRequestChanges = async () => {
    if (!feedback.trim()) return;
    setIsLoading(true);
    try {
      const newMessages = await fetchMessages(bakeries, offers, selectedOfferIds, feedback);
      onMessagesChange(newMessages);
      setFeedback("");
      setShowFeedback(false);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
    setIsLoading(false);
  };

  const hasMessages = messages.length > 0 && messages[0].subject !== "";

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Séquence de prospection</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? "Génération de tes messages en cours…" : "Voici les 3 messages proposés pour ta campagne."}
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Génération en cours…</p>
        </div>
      )}

      {!isLoading && hasMessages && (
        <>
          {messages.map((msg, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${MESSAGE_LABELS[i]?.color || ""}`}>
                  {MESSAGE_LABELS[i]?.label || `Message ${i + 1}`}
                </span>
                <Badge variant="outline" className="text-xs gap-1">
                  <Sparkles className="h-3 w-3" /> généré
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{msg.subject}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{msg.body}</p>
              </div>
            </div>
          ))}

          {/* Feedback section */}
          {!showFeedback ? (
            <div className="flex gap-3">
              <Button onClick={onNext} fullWidth size="lg">
                Valider les messages
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFeedback(true)}
                className="flex-shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Qu'est-ce qui ne te convient pas ?</p>
              <Textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Ex : ton trop formel, ajouter plus d'humour, mettre en avant le pain bio…"
                rows={3}
                className="text-sm"
              />
              <Button onClick={handleRequestChanges} disabled={!feedback.trim()} fullWidth size="lg">
                Regénérer les messages
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StepMessages;
