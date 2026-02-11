import * as React from "react";
import { useState } from "react";
import { BottomSheet } from "./ui/bottom-sheet";
import { BadgeCategory, CategoryType } from "./ui/badge-category";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { 
  Mail, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailHistoryItem {
  id: string;
  date: string;
  type: string;
  subject: string;
  body: string;
}

interface ProspectDetail {
  id: string;
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

interface ProspectDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: ProspectDetail | null;
  isCalled?: boolean;
  onToggleCalled?: () => void;
}

// Mock email history data
const mockEmailHistory: EmailHistoryItem[] = [
  {
    id: "1",
    date: "03/02/2026",
    type: "Relance 3",
    subject: "Toujours partant pour du pain frais ?",
    body: `Bonjour,

Je me permets de vous recontacter concernant notre offre de pain artisanal pour votre établissement.

Nous proposons des livraisons quotidiennes avant 7h, avec une large gamme de pains traditionnels et spéciaux.

Seriez-vous disponible pour un essai gratuit cette semaine ?

Cordialement,
Votre boulanger de quartier`,
  },
  {
    id: "2",
    date: "27/01/2026",
    type: "Relance 2",
    subject: "Une dégustation gratuite pour votre équipe ?",
    body: `Bonjour,

Suite à mon précédent message, je souhaitais vous proposer une dégustation gratuite de nos produits pour votre équipe.

Notre gamme comprend des viennoiseries fraîches, du pain bio et des spécialités régionales.

N'hésitez pas à me contacter pour organiser cette dégustation.

Bien cordialement,
Votre boulanger`,
  },
  {
    id: "3",
    date: "20/01/2026",
    type: "Relance 1",
    subject: "Du pain frais pour votre établissement ?",
    body: `Bonjour,

Je me permets de vous recontacter suite à mon premier email concernant notre service de livraison de pain artisanal.

Nous travaillons avec plusieurs établissements de votre quartier et serions ravis de vous compter parmi nos partenaires.

À bientôt,
Votre boulanger`,
  },
  {
    id: "4",
    date: "13/01/2026",
    type: "Email initial",
    subject: "Partenariat boulanger pour Le Bistrot Gourmand",
    body: `Bonjour,

Je suis artisan boulanger à Paris 11 et je propose un service de livraison quotidienne de pain frais pour les professionnels du quartier.

Notre boulangerie utilise des farines locales et des méthodes traditionnelles pour vous garantir un pain de qualité.

Je serais ravi d'échanger avec vous sur vos besoins.

Cordialement,
Jean Dupont
Boulangerie du Centre`,
  },
];

const ProspectDetailSheet: React.FC<ProspectDetailSheetProps> = ({
  isOpen,
  onClose,
  prospect,
  isCalled = false,
  onToggleCalled,
}) => {
  const [expandedEmails, setExpandedEmails] = useState<string[]>([]);

  if (!prospect) return null;

  const toggleEmail = (emailId: string) => {
    setExpandedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId]
    );
  };

  // Use mock history for demo
  const emailHistory = mockEmailHistory;

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
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">{prospect.currentStage} envoyée</p>
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

        {/* Called action - only show when NOT already in responses */}
        {onToggleCalled && !prospect.hasResponse && (
          <button
            onClick={onToggleCalled}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all mb-6",
              isCalled
                ? "bg-success/10 border-success/30 text-success"
                : "bg-muted/50 border-border text-foreground hover:border-primary/30"
            )}
          >
            <Checkbox
              checked={isCalled}
              className="h-5 w-5 pointer-events-none"
            />
            <div className="text-left">
              <p className="text-sm font-medium">
                {isCalled ? "Appelé et répondu ✓" : "J'ai été appelé et j'ai bien répondu"}
              </p>
              {!isCalled && (
                <p className="text-xs text-muted-foreground">Le prospect passera dans "Réponses reçues"</p>
              )}
            </div>
          </button>
        )}

        {/* Email Timeline */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Historique des emails</h3>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-border" />

            {/* Timeline Items */}
            <div className="space-y-4">
              {emailHistory.map((email, index) => (
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
    </BottomSheet>
  );
};

export { ProspectDetailSheet };
export type { ProspectDetail };
