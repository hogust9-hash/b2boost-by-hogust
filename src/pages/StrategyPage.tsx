import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Sparkles, MapPin, UtensilsCrossed, Bed, GraduationCap, Building2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface CategoryData {
  icon: LucideIcon;
  label: string;
  count: number;
  colorClass: string;
}

const categories: CategoryData[] = [
  { icon: UtensilsCrossed, label: "Restaurants", count: 18, colorClass: "badge-restauration" },
  { icon: GraduationCap, label: "Écoles", count: 12, colorClass: "badge-education" },
  { icon: Bed, label: "Hôtels", count: 8, colorClass: "badge-hebergement" },
  { icon: Building2, label: "Entreprises", count: 9, colorClass: "badge-entreprises" },
];

const emailExamples = [
  {
    id: "restaurant",
    type: "📧 Email Restaurant type",
    subject: "Du pain frais pour Le Bistrot du Coin ?",
    body: `Bonjour,

Je suis artisan boulanger à Paris 11 et je propose des livraisons quotidiennes de pain frais et de viennoiseries pour les restaurants du quartier.

Nous travaillons avec des farines locales et cuisons tout sur place chaque matin. Nos clients apprécient particulièrement notre baguette tradition et nos croissants pur beurre.

Serais-tu intéressé par une dégustation gratuite ?

Cordialement,
Ton boulanger de quartier`,
  },
  {
    id: "entreprise",
    type: "📧 Email Entreprise type",
    subject: "Petit-déjeuner d'équipe : du frais livré chaque matin ?",
    body: `Bonjour,

Je suis artisan boulanger et je propose aux entreprises du quartier un service de livraison matinale pour les petits-déjeuners d'équipe.

Croissants, pains au chocolat, brioches... Tout est préparé la nuit et livré avant 8h30.

Idéal pour tes réunions du matin ou pour fidéliser tes équipes !

Veux-tu que je t'envoie notre carte et nos tarifs entreprise ?

À bientôt,
Ton boulanger`,
  },
];

interface StrategyPageProps {
  isEmpty?: boolean;
}

const StrategyPage: React.FC<StrategyPageProps> = ({ isEmpty = false }) => {
  const navigate = useNavigate();

  // Mock data - would come from analysis results
  const prospectsCount = isEmpty ? 0 : 47;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border h-14 z-50">
        <div className="flex items-center h-full px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-foreground hover:text-primary transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground ml-2">
            Ta stratégie
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-lg mx-auto pb-36">
        {isEmpty ? (
          <EmptyState onExpand={() => navigate("/campaign/config")} />
        ) : (
          <StrategyContent prospectsCount={prospectsCount} />
        )}
      </main>

      {/* Fixed Bottom Actions */}
      {!isEmpty && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 pb-safe">
          <div className="max-w-lg mx-auto space-y-3">
            <button
              onClick={() => navigate("/campaign/config")}
              className="w-full text-center text-sm text-primary hover:underline underline-offset-4 transition-all"
            >
              Modifier mes paramètres
            </button>
            <Button fullWidth size="lg">
              Valider et lancer la campagne
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Strategy Content Component
interface StrategyContentProps {
  prospectsCount: number;
}

const StrategyContent: React.FC<StrategyContentProps> = ({ prospectsCount }) => (
  <div className="space-y-6">
    {/* Hero Block - Prospects Count */}
    <div className="bg-primary rounded-xl p-6 text-primary-foreground relative overflow-hidden">
      <div className="relative z-10">
        <p className="text-5xl font-bold mb-2">{prospectsCount}</p>
        <p className="text-primary-foreground/90 text-lg">
          prospects identifiés dans ta zone
        </p>
      </div>
      <Target className="absolute right-4 top-1/2 -translate-y-1/2 h-20 w-20 text-primary-foreground/20" />
    </div>

    {/* Category Distribution */}
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">
        Types de prospects
      </h2>
      <div className="flex flex-wrap gap-2">
         {categories.map((cat) => (
          <span
            key={cat.label}
            className={cn(cat.colorClass, "gap-1.5")}
          >
            <cat.icon className="h-3.5 w-3.5" />
            <span>{cat.label}</span>
            <span className="font-semibold">({cat.count})</span>
          </span>
        ))}
      </div>
    </section>

    {/* Email Previews */}
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">
        Exemples d'emails générés
      </h2>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Accordion type="single" collapsible>
          {emailExamples.map((email, index) => (
            <AccordionItem 
              key={email.id} 
              value={email.id}
              className={cn(index === emailExamples.length - 1 && "border-b-0")}
            >
              <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                <span className="text-sm font-medium">{email.type}</span>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Objet
                    </span>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {email.subject}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Aperçu
                    </span>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line leading-relaxed">
                      {email.body}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    {/* Detected Tone */}
    <section>
      <div className="bg-muted rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            Ton détecté
          </p>
          <p className="text-sm text-muted-foreground">
            Artisanal, chaleureux, local
          </p>
        </div>
      </div>
    </section>
  </div>
);

// Empty State Component
interface EmptyStateProps {
  onExpand: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onExpand }) => (
  <div className="flex flex-col items-center justify-center text-center py-16">
    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
      <MapPin className="h-10 w-10 text-muted-foreground" />
    </div>
    <h2 className="text-xl font-semibold text-foreground mb-2">
      Aucun prospect trouvé
    </h2>
    <p className="text-muted-foreground mb-8 max-w-xs">
      Ta zone semble déjà bien couverte, ou le périmètre est trop restreint.
    </p>
    <Button onClick={onExpand} size="lg">
      Élargir mon périmètre
    </Button>
  </div>
);

export default StrategyPage;
