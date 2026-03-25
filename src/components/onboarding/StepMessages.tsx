import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface MessageEntry {
  subject: string;
  body: string;
  cible: string;
}

interface StepMessagesProps {
  onNext: () => void;
  messages: MessageEntry[];
  onMessagesChange: (messages: MessageEntry[]) => void;
  sessionId: string | null;
}

const MESSAGE_LABELS = [
  { label: "Message 1 — Email initial", color: "bg-primary/10 text-primary" },
  { label: "Message 2 — Relance 1", color: "bg-amber-100 text-amber-700" },
  { label: "Message 3 — Relance 2", color: "bg-orange-100 text-orange-700" },
  { label: "Message 4 — Relance 3", color: "bg-red-100 text-red-600" },
  { label: "Message 5 — Dernière chance", color: "bg-red-200 text-red-800" },
];

const DELAYS = ["J+3", "J+3", "J+4", "J+6"];

const StepMessages: React.FC<StepMessagesProps> = ({ onNext }) => {
  return (
    <div className="space-y-6 px-4 py-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Séquence de prospection</h2>
      </div>

      {/* Info bubble about the cycle */}
      <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80">
          Nous préconisons un cycle de prospection sur <strong>3 semaines</strong>, avec un contact initial suivi de relances espacées pour créer du lien, se faire connaître et donner une bonne impression à vos prospects.
        </p>
      </div>

      {/* Timeline of messages with delays */}
      <div className="space-y-0">
        {MESSAGE_LABELS.map((msg, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-3 py-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex-shrink-0">
                {i + 1}
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${msg.color}`}>
                {msg.label}
              </span>
            </div>

            {/* Delay separator between messages */}
            {i < MESSAGE_LABELS.length - 1 && i < DELAYS.length && (
              <div className="flex items-center justify-center gap-2 py-1 ml-4">
                <div className="w-px h-4 bg-border" />
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
                <div className="w-px h-4 bg-border" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <Button onClick={onNext} fullWidth size="lg">
        <Check className="h-4 w-4" />
        J'ai compris — Suivant
      </Button>
    </div>
  );
};

export default StepMessages;
