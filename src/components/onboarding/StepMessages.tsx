import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  sessionId: string | null;
}

const MESSAGE_LABELS = [
  { label: "Message 1 — Découverte", color: "bg-primary/10 text-primary" },
  { label: "Message 2 — Relance", color: "bg-amber-100 text-amber-700" },
  { label: "Message 3 — Dernière chance", color: "bg-red-100 text-red-700" },
];

const StepMessages: React.FC<StepMessagesProps> = ({ onNext, messages, onMessagesChange, bakeries, offers, selectedOfferIds, sessionId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount, poll Supabase for messages (n8n writes them in background)
  useEffect(() => {
    if (!sessionId || messages.length > 0) return;

    setIsLoading(true);
    
    const pollMessages = () => {
      pollingRef.current = setInterval(async () => {
        const { data, error } = await supabase
          .from("onboarding_messages")
          .select("*")
          .eq("session_id", sessionId)
          .order("step_number", { ascending: true });

        if (!error && data && data.length >= 3) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;

          const msgs: MessageEntry[] = data.map(m => ({
            subject: m.subject || "",
            body: m.body || "",
          }));
          onMessagesChange(msgs);
          setIsLoading(false);
        }
      }, 3000);
    };

    pollMessages();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [sessionId]);


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
          <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-[progress_30s_ease-in-out_forwards]" />
          </div>
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
