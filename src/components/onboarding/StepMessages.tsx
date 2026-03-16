import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, MessageSquare, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

export interface MessageEntry {
  subject: string;
  body: string;
}

interface StepMessagesProps {
  onNext: () => void;
  messages: MessageEntry[];
  onMessagesChange: (messages: MessageEntry[]) => void;
  sessionId: string | null;
}

const MESSAGE_LABELS = [
  { label: "Message 1 — Découverte", color: "bg-primary/10 text-primary" },
  { label: "Message 2 — Relance 1", color: "bg-amber-100 text-amber-700" },
  { label: "Message 3 — Relance 2", color: "bg-orange-100 text-orange-700" },
  { label: "Message 4 — Relance 3", color: "bg-red-100 text-red-600" },
  { label: "Message 5 — Dernière chance", color: "bg-red-200 text-red-800" },
];

const DELAYS = ["J+3", "J+3", "J+4", "J+6"];

const WEBHOOK_URL = "https://n8n.beautifulflow.ai/webhook/depot-offres";

const StepMessages: React.FC<StepMessagesProps> = ({ onNext, messages, onMessagesChange, sessionId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = async (): Promise<boolean> => {
    if (!sessionId) return false;
    const { data, error } = await supabase
      .from("onboarding_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("step_number", { ascending: true });

    if (!error && data && data.length >= 5) {
      const msgs: MessageEntry[] = data.map(m => ({
        subject: m.subject || "",
        body: m.body || "",
      }));
      onMessagesChange(msgs);
      return true;
    }
    return false;
  };

  const revealAfterDelay = () => {
    setTimeout(() => setIsLoading(false), 1500);
  };

  const startPolling = async () => {
    if (!sessionId) return;
    setIsLoading(true);

    const found = await fetchMessages();
    if (found) {
      revealAfterDelay();
      return;
    }

    pollingRef.current = setInterval(async () => {
      const done = await fetchMessages();
      if (done && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        revealAfterDelay();
      }
    }, 3000);
  };

  useEffect(() => {
    if (!sessionId || messages.length > 0) return;
    startPolling();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [sessionId]);

  const handleReject = () => {
    setShowFeedback(true);
  };

  const handleSendFeedback = async () => {
    if (!feedback.trim() || !sessionId) return;
    setIsSendingFeedback(true);

    try {
      await supabase
        .from("onboarding_messages")
        .delete()
        .eq("session_id", sessionId);

      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("action", "regenerate_messages");
      formData.append("feedback", feedback.trim());

      await fetch(WEBHOOK_URL, { method: "POST", body: formData });

      onMessagesChange([]);
      setShowFeedback(false);
      setFeedback("");
      setIsSendingFeedback(false);
      startPolling();
    } catch (err) {
      console.error("Failed to send feedback:", err);
      setIsSendingFeedback(false);
    }
  };

  const hasMessages = messages.length > 0 && messages[0].subject !== "";

  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Séquence de prospection</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? "Génération de tes messages en cours…" : "Voici des exemples de messages pour ta campagne."}
        </p>
      </div>

      {/* Info bubble about the cycle */}
      {!isLoading && hasMessages && (
        <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
          <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80">
            Nous préconisons un cycle de prospection sur <strong>3 semaines</strong>, avec un contact initial suivi de relances espacées pour créer du lien, se faire connaître et donner une bonne impression à vos prospects.
          </p>
        </div>
      )}

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
            <React.Fragment key={i}>
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${MESSAGE_LABELS[i]?.color || ""}`}>
                    {MESSAGE_LABELS[i]?.label || `Message ${i + 1}`}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{msg.subject}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{msg.body}</p>
                </div>
              </div>

              {/* Delay separator between messages */}
              {i < messages.length - 1 && i < DELAYS.length && (
                <div className="flex items-center justify-center gap-2 py-1">
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {DELAYS[i]}
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-muted-foreground hover:text-primary transition-colors">
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 text-xs">
                        Délai avant l'envoi du prochain message. Nous préconisons un cycle sur 3 semaines pour optimiser l'impact de votre prospection.
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}
            </React.Fragment>
          ))}

          {showFeedback ? (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Qu'est-ce que tu souhaites modifier ?</p>
              <Textarea
                placeholder="Ex : Ton trop formel, mettre en avant les viennoiseries, ajouter une offre de bienvenue…"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setShowFeedback(false); setFeedback(""); }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSendFeedback}
                  disabled={!feedback.trim() || isSendingFeedback}
                  className="flex-1"
                >
                  {isSendingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button onClick={onNext} fullWidth size="lg">
                <Check className="h-4 w-4" />
                Valider les messages
              </Button>
              <Button variant="outline" onClick={handleReject} fullWidth size="lg">
                <MessageSquare className="h-4 w-4" />
                Demander des modifications
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StepMessages;
