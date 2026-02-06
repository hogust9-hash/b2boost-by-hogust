import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { BadgeCategory, CategoryType } from "@/components/ui/badge-category";
import { BadgeStage } from "@/components/ui/badge-stage";
import { BadgeOffer } from "@/components/ui/badge-offer";
import { BadgeNew } from "@/components/ui/badge-new";

const categories: CategoryType[] = [
  "restauration",
  "hebergement",
  "education",
  "entreprises",
  "collectivites",
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header notificationCount={3} />
      
      <main className="px-4 py-6 max-w-lg mx-auto space-y-8">
        {/* Section Boutons */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Boutons</h2>
          <div className="card-base space-y-4">
            <Button fullWidth="mobile">Button Primary</Button>
            <Button variant="secondary" fullWidth="mobile">Button Secondary</Button>
            <Button variant="text">Button Text</Button>
          </div>
        </section>

        {/* Section Inputs */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Inputs</h2>
          <div className="card-base space-y-4">
            <FormField 
              label="Nom de l'entreprise" 
              placeholder="Ex: Restaurant Le Gourmet" 
            />
            <FormField 
              label="Email" 
              type="email"
              placeholder="contact@entreprise.fr" 
            />
            <FormField 
              label="Avec erreur" 
              placeholder="Champ invalide"
              error="Ce champ est requis"
            />
          </div>
        </section>

        {/* Section Badges Category */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Badges Catégorie</h2>
          <div className="card-base">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <BadgeCategory key={cat} category={cat} />
              ))}
            </div>
          </div>
        </section>

        {/* Section Badges Stage */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Badges Stage</h2>
          <div className="card-base">
            <div className="flex flex-wrap gap-2">
              <BadgeStage label="Nouveau" />
              <BadgeStage label="Relance 1" />
              <BadgeStage label="Relance 2" />
              <BadgeStage label="En attente" />
            </div>
          </div>
        </section>

        {/* Section Badges Offer */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Badges Offre</h2>
          <div className="card-base">
            <div className="flex flex-wrap gap-2">
              <BadgeOffer label="Petit-déjeuner" />
              <BadgeOffer label="Traiteur" />
              <BadgeOffer label="Viennoiseries" />
              <BadgeOffer label="Pain bio" />
            </div>
          </div>
        </section>

        {/* Section Badge New */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Badge Nouveau</h2>
          <div className="card-base">
            <div className="flex items-center gap-6">
              <div className="relative inline-block">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Card</span>
                </div>
                <BadgeNew />
              </div>
              <span className="text-sm text-muted-foreground">
                Indicateur visuel pour les nouveaux éléments
              </span>
            </div>
          </div>
        </section>

        {/* Section Exemple de Card Interactive */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Card Interactive</h2>
          <div className="card-interactive relative">
            <BadgeNew />
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Restaurant Le Gourmet</h3>
                <p className="text-sm text-muted-foreground">15 rue de la Paix, Paris</p>
                <div className="flex flex-wrap gap-2">
                  <BadgeCategory category="restauration" />
                  <BadgeStage label="Relance 1" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <BadgeOffer label="Petit-déjeuner" />
              <BadgeOffer label="Traiteur" />
            </div>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
