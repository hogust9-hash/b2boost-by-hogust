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

// Mock email history data — ordered from most recent to oldest
const mockEmailHistory: EmailHistoryItem[] = [
  {
    id: "5",
    date: "10/02/2026",
    type: "Relance 4",
    subject: "On se rencontre pour en discuter ?",
    body: `Bonjour,\n\nJe reviens vers toi une dernière fois pour te proposer un rendez-vous rapide.\n\nCordialement,\nTon boulanger`,
    sent: false,
  },
  {
    id: "1",
    date: "03/02/2026",
    type: "Relance 3",
    subject: "Toujours partant pour du pain frais ?",
    body: `Bonjour,\n\nJe me permets de te recontacter concernant notre offre de pain artisanal pour ton établissement.\n\nNous proposons des livraisons quotidiennes avant 7h, avec une large gamme de pains traditionnels et spéciaux.\n\nSerais-tu disponible pour un essai gratuit cette semaine ?\n\nCordialement,\nTon boulanger de quartier`,
    sent: true,
  },
  {
    id: "2",
    date: "27/01/2026",
    type: "Relance 2",
    subject: "Une dégustation gratuite pour ton équipe ?",
    body: `Bonjour,\n\nSuite à mon précédent message, je souhaitais te proposer une dégustation gratuite de nos produits pour ton équipe.\n\nNotre gamme comprend des viennoiseries fraîches, du pain bio et des spécialités régionales.\n\nN'hésite pas à me contacter pour organiser cette dégustation.\n\nBien cordialement,\nTon boulanger`,
    sent: true,
  },
  {
    id: "3",
    date: "20/01/2026",
    type: "Relance 1",
    subject: "Du pain frais pour ton établissement ?",
    body: `Bonjour,\n\nJe me permets de te recontacter suite à mon premier email concernant notre service de livraison de pain artisanal.\n\nNous travaillons avec plusieurs établissements de ton quartier et serions ravis de te compter parmi nos partenaires.\n\nÀ bientôt,\nTon boulanger`,
    sent: true,
  },
  {
    id: "4",
    date: "13/01/2026",
    type: "Email initial",
    subject: "Partenariat boulanger pour Le Bistrot Gourmand",
    body: `Bonjour,\n\nJe suis artisan boulanger à Paris 11 et je propose un service de livraison quotidienne de pain frais pour les professionnels du quartier.\n\nNotre boulangerie utilise des farines locales et des méthodes traditionnelles pour te garantir un pain de qualité.\n\nJe serais ravi d'échanger avec toi sur tes besoins.\n\nCordialement,\nJean Dupont\nBoulangerie du Centre`,
    sent: true,
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

        {/* Spacer for sticky button */}
        {onToggleCalled && !prospect.hasResponse && <div className="h-20" />}

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
