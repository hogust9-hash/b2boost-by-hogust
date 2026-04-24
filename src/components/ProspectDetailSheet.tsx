import * as React from "react";
import { useEffect, useState } from "react";
import { BottomSheet } from "./ui/bottom-sheet";
import { BadgeCategory, CategoryType } from "./ui/badge-category";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail,
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  Square
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailHistoryItem {
  id: string;
  date: string;
  type: string;
  subject: string;
  body: string;
  sent: boolean;
}

interface ProspectDetail {
  id: string;
  campaignId: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  hasResponse: boolean;
  currentStage: string;
  currentStageDate: string;
  totalStages: number;
  completedStages: number;
  emailHistory: EmailHistoryItem[];
}

interface CampaignMessage {
  step_number: number;
  subject: string | null;
  body: string | null;
}

interface ProspectDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: ProspectDetail | null;
  isCalled?: boolean;
  onToggleCalled?: () => void;
}

const formatFrDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const getEmailType = (step: number | null): string => {
  if (!step || step <= 1) return "Email initial";
  return `Relance ${step - 1}`;
};

const ProspectDetailSheet: React.FC<ProspectDetailSheetProps> = ({
  isOpen,
  onClose,
  prospect,
  isCalled = false,
  onToggleCalled,
}) => {
  const [expandedEmails, setExpandedEmails] = useState<string[]>([]);
  const [sentEmails, setSentEmails] = useState<EmailHistoryItem[]>([]);
  const [nextMessage, setNextMessage] = useState<CampaignMessage | null>(null);

  useEffect(() => {
    if (!prospect || !isOpen) return;

    let cancelled = false;
    const loadProspectMessages = async () => {
      const [{ data: events }, { data: nextMessage }] = await Promise.all([
        supabase
          .from("email_events")
          .select("event_type, step_number, subject, occurred_at")
          .eq("campaign_prospect_id", prospect.id)
          .order("occurred_at", { ascending: true }),
        supabase
          .from("campaign_messages")
          .select("step_number, subject, body")
          .eq("campaign_id", prospect.campaignId)
          .eq("step_number", prospect.completedStages + 1)
          .single(),
      ]);

      if (cancelled) return;
      setSentEmails(
        (events ?? [])
          .map((event: any, index) => ({
            id: `${event.event_type}-${event.step_number ?? index}-${event.occurred_at}`,
            date: formatFrDate(event.occurred_at),
            type: getEmailType(event.step_number),
            subject: event.subject ?? "Sans objet",
            body: "",
            sent: true,
          }))
          .reverse()
      );
      setNextMessage((nextMessage as CampaignMessage | null) ?? null);
    };

    loadProspectMessages();
    return () => { cancelled = true; };
  }, [isOpen, prospect]);

  if (!prospect) return null;

  const toggleEmail = (emailId: string) => {
    setExpandedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId]
    );
  };

  const nextEmail = nextMessage
    ? {
        id: String(nextMessage.step_number),
        type: getEmailType(nextMessage.step_number),
        date: "date planifiée par la campagne",
        subject: nextMessage.subject ?? "Sans objet",
        body: nextMessage.body ?? "",
      }
    : null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="px-4 pb-24">
        {/* Response Banner */}
        {prospect.hasResponse && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
            <span className="text-sm font-medium text-success">
              Ce prospect a répondu !
            </span>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 pr-8">
          <div className="flex items-start gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-foreground">{prospect.name}</h2>
            <BadgeCategory 
              category={prospect.category} 
              label={prospect.categoryLabel}
              className="text-xs px-2 py-0.5"
            />
          </div>
        </div>

        {/* Status Block */}
        <div className="bg-muted rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Mail className={cn("h-5 w-5", prospect.hasResponse ? "text-success" : "text-primary")} />
            <div>
              <p className="font-medium text-foreground">
                {prospect.hasResponse ? "Réponse reçue !!" : `${prospect.currentStage} envoyée`}
              </p>
              <p className="text-sm text-muted-foreground">le {prospect.currentStageDate}</p>
            </div>
          </div>
          
          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Progression :</span>
            <div className="flex gap-1.5">
              {Array.from({ length: prospect.totalStages }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    index < prospect.completedStages
                      ? "bg-primary"
                      : "bg-border"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {prospect.completedStages}/{prospect.totalStages}
            </span>
          </div>
        </div>

        {/* Client Response */}
        {prospect.hasResponse && (
          <div className="mb-6">
            <button
              onClick={() => toggleEmail("client-response")}
              className="inline-flex items-center gap-1 text-sm font-medium text-success hover:underline underline-offset-4 transition-all"
            >
              {expandedEmails.includes("client-response") ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Masquer la réponse reçue
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Voir la réponse reçue
                </>
              )}
            </button>

            {expandedEmails.includes("client-response") && (
              <div className="mt-3 bg-success/5 border border-success/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-1">De : {prospect.name}</p>
                <p className="text-sm text-foreground font-medium mb-2">Re: {sentEmails.length > 0 ? sentEmails[0].subject : "Partenariat boulanger"}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  Bonjour,{"\n\n"}Merci pour votre proposition, cela m'intéresse beaucoup ! Pourriez-vous passer cette semaine pour qu'on en discute autour d'un café ?{"\n\n"}Je suis disponible mardi et jeudi matin.{"\n\n"}Cordialement,{"\n"}{prospect.name}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Spacer for sticky button */}
        {onToggleCalled && !prospect.hasResponse && <div className="h-20" />}

        {/* Next Email */}
        {nextEmail && (
          <div className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">Prochain email</h3>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{nextEmail.type}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Envoi prévu le {nextEmail.date}</p>
              <p className="text-sm text-foreground mb-2">Objet : {nextEmail.subject}</p>

              <button
                onClick={() => toggleEmail(`next-${nextEmail.id}`)}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4 transition-all"
              >
                {expandedEmails.includes(`next-${nextEmail.id}`) ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Masquer l'email
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Voir l'email
                  </>
                )}
              </button>

              {expandedEmails.includes(`next-${nextEmail.id}`) && (
                <div className="mt-3 bg-background rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {nextEmail.body}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sent Emails Timeline */}
        {sentEmails.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-4">Emails envoyés</h3>
            
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-border" />

              {/* Timeline Items */}
              <div className="space-y-4">
                {sentEmails.map((email, index) => (
                  <div key={email.id} className="relative pl-7">
                    {/* Dot */}
                    <div
                      className={cn(
                        "absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 bg-card",
                        index === 0 ? "border-primary" : "border-border"
                      )}
                    />

                    {/* Content */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">{email.date}</span>
                        <span className="font-medium text-foreground">{email.type}</span>
                      </div>
                      
                      <p className="text-sm text-foreground mb-2">
                        Objet : {email.subject}
                      </p>

                      <button
                        onClick={() => toggleEmail(email.id)}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline underline-offset-4 transition-all"
                      >
                        {expandedEmails.includes(email.id) ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Masquer l'email
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Voir l'email
                          </>
                        )}
                      </button>

                      {/* Expanded Email Content */}
                      {expandedEmails.includes(email.id) && (
                        <div className="mt-3 bg-background rounded-lg p-4 border border-border">
                          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                            {email.body}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed CTA for responses */}
      {prospect.hasResponse && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 pb-safe">
          <Button fullWidth size="lg">
            <ExternalLink className="h-5 w-5" />
            Consulter la réponse dans ma boîte mail
          </Button>
        </div>
      )}

      {/* Sticky called button */}
      {onToggleCalled && !prospect.hasResponse && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 pb-safe">
          <button
            onClick={onToggleCalled}
            className={cn(
              "w-full flex flex-col items-center gap-1 py-3.5 rounded-full border-2 transition-all",
              isCalled
                ? "bg-success/10 border-success text-success"
                : "bg-card border-primary text-primary hover:bg-primary/5"
            )}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              {isCalled ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Contacté et répondu ✓
                </>
              ) : (
              <>
                <Square className="h-4 w-4" />
                J'ai été contacté et j'ai bien répondu
              </>
              )}
            </span>
            {!isCalled && (
              <span className="text-xs text-muted-foreground">Le prospect passera dans "Réponses reçues"</span>
            )}
          </button>
        </div>
      )}
    </BottomSheet>
  );
};

export { ProspectDetailSheet };
export type { ProspectDetail };
