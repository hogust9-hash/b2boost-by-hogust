import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ProspectCard } from "@/components/ProspectCard";
import { CategoryType } from "@/components/ui/badge-category";

interface Prospect {
  id: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  stage: string;
  offer: string;
  lastSentDate: string;
  isNew: boolean;
}

const mockProspects: Prospect[] = [
  {
    id: "1",
    name: "Restaurant Le Gourmet",
    category: "restauration",
    categoryLabel: "Restaurant",
    stage: "Relance 1",
    offer: "Petit-déjeuner",
    lastSentDate: "05 fév. 2026",
    isNew: true,
  },
  {
    id: "2",
    name: "Hôtel & Spa Le Majestic",
    category: "hebergement",
    categoryLabel: "Hôtel",
    stage: "Relance 3",
    offer: "Viennoiseries",
    lastSentDate: "02 fév. 2026",
    isNew: true,
  },
  {
    id: "3",
    name: "Lycée Jean Moulin",
    category: "education",
    categoryLabel: "Lycée",
    stage: "Email initial",
    offer: "Pain bio",
    lastSentDate: "01 fév. 2026",
    isNew: false,
  },
  {
    id: "4",
    name: "TechCorp Solutions",
    category: "entreprises",
    categoryLabel: "Entreprise",
    stage: "Relance 2",
    offer: "Traiteur",
    lastSentDate: "28 jan. 2026",
    isNew: false,
  },
  {
    id: "5",
    name: "Mairie de Bordeaux",
    category: "collectivites",
    categoryLabel: "Mairie",
    stage: "En attente",
    offer: "Événementiel",
    lastSentDate: "25 jan. 2026",
    isNew: false,
  },
];

const Index = () => {
  const handleCardClick = (prospect: Prospect) => {
    console.log("Prospect clicked:", prospect.name);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header notificationCount={2} />
      
      <main className="px-4 py-6 max-w-lg mx-auto">
        {/* Section titre */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-foreground">Prospects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mockProspects.length} prospects en cours
          </p>
        </div>

        {/* Liste des ProspectCards */}
        <div className="space-y-3">
          {mockProspects.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              name={prospect.name}
              category={prospect.category}
              categoryLabel={prospect.categoryLabel}
              stage={prospect.stage}
              offer={prospect.offer}
              lastSentDate={prospect.lastSentDate}
              isNew={prospect.isNew}
              onClick={() => handleCardClick(prospect)}
            />
          ))}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Index;
