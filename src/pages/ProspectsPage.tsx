import * as React from "react";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ProspectCard } from "@/components/ProspectCard";
import { ProspectDetailSheet, ProspectDetail } from "@/components/ProspectDetailSheet";
import { CategoryType } from "@/components/ui/badge-category";
import { Mail, ChevronDown, ChevronUp, CheckCircle2, Send, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Prospect {
  id: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  stage: string;
  offer: string;
  lastSentDate: string;
  isNew: boolean;
  status: "response" | "in_progress" | "finished";
}

// Mock data
const mockProspects: Prospect[] = [
  // Responses received (2)
  {
    id: "1",
    name: "Restaurant Le Gourmet",
    category: "restauration",
    categoryLabel: "Restaurant",
    stage: "Réponse reçue",
    offer: "Petit-déjeuner",
    lastSentDate: "05 fév. 2026",
    isNew: true,
    status: "response",
  },
  {
    id: "2",
    name: "Hôtel & Spa Le Majestic",
    category: "hebergement",
    categoryLabel: "Hôtel",
    stage: "Réponse reçue",
    offer: "Viennoiseries",
    lastSentDate: "02 fév. 2026",
    isNew: false,
    status: "response",
  },
  // In progress (8)
  {
    id: "3",
    name: "Lycée Jean Moulin",
    category: "education",
    categoryLabel: "Lycée",
    stage: "Email initial",
    offer: "Pain bio",
    lastSentDate: "01 fév. 2026",
    isNew: false,
    status: "in_progress",
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
    status: "in_progress",
  },
  {
    id: "5",
    name: "Mairie de Bordeaux",
    category: "collectivites",
    categoryLabel: "Mairie",
    stage: "Relance 1",
    offer: "Événementiel",
    lastSentDate: "25 jan. 2026",
    isNew: false,
    status: "in_progress",
  },
  {
    id: "6",
    name: "Bistrot du Marché",
    category: "restauration",
    categoryLabel: "Bistrot",
    stage: "Relance 3",
    offer: "Petit-déjeuner",
    lastSentDate: "24 jan. 2026",
    isNew: false,
    status: "in_progress",
  },
  {
    id: "7",
    name: "Résidence Les Jardins",
    category: "hebergement",
    categoryLabel: "Résidence",
    stage: "Email initial",
    offer: "Goûter",
    lastSentDate: "23 jan. 2026",
    isNew: false,
    status: "in_progress",
  },
  {
    id: "8",
    name: "Startup Valley",
    category: "entreprises",
    categoryLabel: "Startup",
    stage: "Relance 1",
    offer: "Petit-déjeuner",
    lastSentDate: "22 jan. 2026",
    isNew: false,
    status: "in_progress",
  },
  {
    id: "9",
    name: "École Montessori",
    category: "education",
    categoryLabel: "École",
    stage: "Relance 2",
    offer: "Goûter",
    lastSentDate: "21 jan. 2026",
    isNew: false,
    status: "in_progress",
  },
  {
    id: "10",
    name: "La Table d'Arthur",
    category: "restauration",
    categoryLabel: "Restaurant",
    stage: "Email initial",
    offer: "Pain artisanal",
    lastSentDate: "20 jan. 2026",
    isNew: false,
    status: "in_progress",
  },
  // Finished without response (3)
  {
    id: "11",
    name: "Café de la Place",
    category: "restauration",
    categoryLabel: "Café",
    stage: "Terminé",
    offer: "Viennoiseries",
    lastSentDate: "10 jan. 2026",
    isNew: false,
    status: "finished",
  },
  {
    id: "12",
    name: "Hôtel du Commerce",
    category: "hebergement",
    categoryLabel: "Hôtel",
    stage: "Terminé",
    offer: "Petit-déjeuner",
    lastSentDate: "08 jan. 2026",
    isNew: false,
    status: "finished",
  },
  {
    id: "13",
    name: "Centre Culturel",
    category: "collectivites",
    categoryLabel: "Centre culturel",
    stage: "Terminé",
    offer: "Événementiel",
    lastSentDate: "05 jan. 2026",
    isNew: false,
    status: "finished",
  },
];

type FilterType = "all" | CategoryType;

interface FilterChip {
  id: FilterType;
  label: string;
  emoji?: string;
  activeColor: string;
}

const filterChips: FilterChip[] = [
  { id: "all", label: "Tous", activeColor: "bg-primary" },
  { id: "restauration", label: "Restauration", emoji: "🍽", activeColor: "bg-category-restauration" },
  { id: "hebergement", label: "Hébergement", emoji: "🏨", activeColor: "bg-category-hebergement" },
  { id: "education", label: "Éducation", emoji: "🏫", activeColor: "bg-category-education" },
  { id: "entreprises", label: "Entreprises", emoji: "🏢", activeColor: "bg-category-entreprises" },
  { id: "collectivites", label: "Collectivités", emoji: "🏛", activeColor: "bg-category-collectivites" },
];

const ProspectsPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    responses: true,
    inProgress: true,
    finished: false,
  });
  const [selectedProspect, setSelectedProspect] = useState<ProspectDetail | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleFilterChange = (filter: FilterType) => {
    if (filter === activeFilter) return;
    setIsLoading(true);
    setActiveFilter(filter);
    setTimeout(() => setIsLoading(false), 500);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCardClick = (prospect: Prospect) => {
    // Convert Prospect to ProspectDetail format
    const detail: ProspectDetail = {
      id: prospect.id,
      name: prospect.name,
      category: prospect.category,
      categoryLabel: prospect.categoryLabel,
      hasResponse: prospect.status === "response",
      currentStage: prospect.stage,
      currentStageDate: prospect.lastSentDate,
      totalStages: 5,
      completedStages: prospect.status === "finished" ? 5 : 
                       prospect.stage.includes("3") ? 4 :
                       prospect.stage.includes("2") ? 3 :
                       prospect.stage.includes("1") ? 2 : 1,
      emailHistory: [],
    };
    setSelectedProspect(detail);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedProspect(null), 300);
  };

  // Filter prospects
  const filteredProspects = mockProspects.filter(
    (p) => activeFilter === "all" || p.category === activeFilter
  );

  const responseProspects = filteredProspects.filter((p) => p.status === "response");
  const inProgressProspects = filteredProspects.filter((p) => p.status === "in_progress");
  const finishedProspects = filteredProspects.filter((p) => p.status === "finished");

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header notificationCount={responseProspects.length} />

      {/* KPI Quick Block */}
      <div className="mx-4 mt-2">
        <div className="bg-muted rounded-lg p-3 flex items-center justify-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground text-center">
            12 emails envoyés cette semaine • 3 relances
          </span>
        </div>
      </div>

      {/* Filter Chips - Sticky */}
      <div className="sticky top-14 bg-background z-40 py-2 border-b border-border">
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => handleFilterChange(chip.id)}
              className={cn(
                "flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                activeFilter === chip.id
                  ? `${chip.activeColor} text-white`
                  : "bg-card border border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {chip.emoji && <span>{chip.emoji}</span>}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="py-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-4">
            {/* Responses Section */}
            <ProspectSection
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Réponses reçues"
              count={responseProspects.length}
              isExpanded={expandedSections.responses}
              onToggle={() => toggleSection("responses")}
              variant="success"
              prospects={responseProspects}
              onCardClick={handleCardClick}
            />

            {/* In Progress Section */}
            <ProspectSection
              icon={<Send className="h-5 w-5" />}
              title="En cours de prospection"
              count={inProgressProspects.length}
              isExpanded={expandedSections.inProgress}
              onToggle={() => toggleSection("inProgress")}
              variant="default"
              prospects={inProgressProspects}
              onCardClick={handleCardClick}
            />

            {/* Finished Section */}
            <ProspectSection
              icon={<Clock className="h-5 w-5" />}
              title="Terminés sans réponse"
              count={finishedProspects.length}
              isExpanded={expandedSections.finished}
              onToggle={() => toggleSection("finished")}
              variant="muted"
              prospects={finishedProspects}
              onCardClick={handleCardClick}
              dimCards
            />
          </div>
        )}
      </main>

      <BottomNavigation />

      {/* Prospect Detail Sheet */}
      <ProspectDetailSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        prospect={selectedProspect}
      />
    </div>
  );
};

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="px-4 space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-3">
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
      </div>
    ))}
  </div>
);

// Prospect Section Component
interface ProspectSectionProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  variant: "success" | "default" | "muted";
  prospects: Prospect[];
  onCardClick: (prospect: Prospect) => void;
  dimCards?: boolean;
}

const ProspectSection: React.FC<ProspectSectionProps> = ({
  icon,
  title,
  count,
  isExpanded,
  onToggle,
  variant,
  prospects,
  onCardClick,
  dimCards = false,
}) => {
  if (count === 0) return null;

  const headerStyles = {
    success: "bg-success/10 border-l-4 border-l-success",
    default: "bg-card border-l-4 border-l-primary",
    muted: "bg-muted border-l-4 border-l-muted-foreground/30",
  };

  const iconStyles = {
    success: "text-success",
    default: "text-primary",
    muted: "text-muted-foreground",
  };

  return (
    <div>
      {/* Section Header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 transition-all duration-200",
          headerStyles[variant]
        )}
      >
        <div className="flex items-center gap-3">
          <span className={iconStyles[variant]}>{icon}</span>
          <span className="font-medium text-foreground">{title}</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              variant === "success"
                ? "bg-destructive text-destructive-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {count}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Section Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className={cn("px-4 py-3 space-y-3", dimCards && "opacity-60")}>
          {prospects.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              name={prospect.name}
              category={prospect.category}
              categoryLabel={prospect.categoryLabel}
              stage={prospect.stage}
              offer={prospect.offer}
              lastSentDate={prospect.lastSentDate}
              isNew={prospect.isNew}
              onClick={() => onCardClick(prospect)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProspectsPage;
