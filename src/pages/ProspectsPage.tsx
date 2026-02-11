import * as React from "react";
import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ProspectCard, StageType } from "@/components/ProspectCard";
import { ProspectDetailSheet, ProspectDetail } from "@/components/ProspectDetailSheet";
import { ProspectCardSkeleton } from "@/components/ui/skeleton-card";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { useCustomToast } from "@/components/ui/custom-toast";
import { CategoryType } from "@/components/ui/badge-category";
import { ChevronDown, ChevronUp, CheckCircle2, Send, Clock, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface Prospect {
  id: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  stage: string;
  stageType: StageType;
  currentStep: number;
  totalSteps: number;
  context: string;
  offers: string[];
  lastSentDate: string;
  isNew: boolean;
  status: "response" | "in_progress" | "finished";
}

// Mock data with new structure
const mockProspects: Prospect[] = [
  // Responses received (2)
  {
    id: "1",
    name: "Restaurant Le Gourmet",
    category: "restauration",
    categoryLabel: "Restaurant",
    stage: "Réponse reçue",
    stageType: "response",
    currentStep: 3,
    totalSteps: 5,
    context: "Restaurant — Orléans, à 0.9 km",
    offers: ["Petit-déjeuner", "Déjeuner", "Traiteur", "Événementiel"],
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
    stageType: "response",
    currentStep: 2,
    totalSteps: 5,
    context: "Hôtel — Orléans, à 1.4 km",
    offers: ["Viennoiseries", "Petit-déjeuner"],
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
    stageType: "initial",
    currentStep: 1,
    totalSteps: 5,
    context: "Lycée — Orléans, à 1.2 km",
    offers: ["Pain bio"],
    lastSentDate: "01 fév. 2026",
    isNew: false,
    status: "in_progress",
  },
  {
    id: "4",
    name: "TechCorp Solutions",
    category: "entreprises",
    categoryLabel: "Entreprise",
    stage: "Relance 2/5",
    stageType: "relance",
    currentStep: 2,
    totalSteps: 5,
    context: "Entreprise — Orléans, à 1.8 km",
    offers: ["Traiteur", "Petit-déjeuner", "Goûter"],
    lastSentDate: "28 jan. 2026",
    isNew: false,
    status: "in_progress",
  },
  {
    id: "5",
    name: "Mairie d'Orléans",
    category: "collectivites",
    categoryLabel: "Mairie",
    stage: "Relance 1/5",
    stageType: "relance",
    currentStep: 1,
    totalSteps: 5,
    context: "Mairie — Orléans, à 0.6 km",
    offers: ["Événementiel"],
    lastSentDate: "25 jan. 2026",
    isNew: false,
    status: "in_progress",
  },
  {
    id: "6",
    name: "Bistrot du Marché",
    category: "restauration",
    categoryLabel: "Bistrot",
    stage: "Relance 3/5",
    stageType: "relance",
    currentStep: 3,
    totalSteps: 5,
    context: "Bistrot — Orléans, à 0.8 km",
    offers: ["Petit-déjeuner", "Déjeuner"],
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
    stageType: "initial",
    currentStep: 1,
    totalSteps: 5,
    context: "Résidence — Orléans, à 1.7 km",
    offers: ["Goûter"],
    lastSentDate: "23 jan. 2026",
    isNew: false,
    status: "in_progress",
  },
  {
    id: "8",
    name: "Coworking L'Atelier",
    category: "entreprises",
    categoryLabel: "Coworking",
    stage: "Relance 1/5",
    stageType: "relance",
    currentStep: 1,
    totalSteps: 5,
    context: "Coworking — Orléans, à 0.4 km",
    offers: ["Petit-déjeuner"],
    lastSentDate: "22 jan. 2026",
    isNew: false,
    status: "in_progress",
  },
  {
    id: "9",
    name: "École Montessori",
    category: "education",
    categoryLabel: "École",
    stage: "Relance 2/5",
    stageType: "relance",
    currentStep: 2,
    totalSteps: 5,
    context: "École — Orléans, à 1.3 km",
    offers: ["Goûter", "Pain bio"],
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
    stageType: "initial",
    currentStep: 1,
    totalSteps: 5,
    context: "Restaurant — Orléans, à 1.1 km",
    offers: ["Pain artisanal", "Viennoiseries", "Petit-déjeuner"],
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
    stageType: "finished",
    currentStep: 5,
    totalSteps: 5,
    context: "Café — Orléans, à 0.5 km",
    offers: ["Viennoiseries"],
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
    stageType: "finished",
    currentStep: 5,
    totalSteps: 5,
    context: "Hôtel — Orléans, à 1.9 km",
    offers: ["Petit-déjeuner"],
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
    stageType: "finished",
    currentStep: 5,
    totalSteps: 5,
    context: "Centre culturel — Orléans, à 1.5 km",
    offers: ["Événementiel", "Traiteur"],
    lastSentDate: "05 jan. 2026",
    isNew: false,
    status: "finished",
  },
];

type CategoryFilterType = CategoryType;

const categoryOptions: { id: CategoryFilterType; label: string; emoji: string }[] = [
  { id: "restauration", label: "Restauration", emoji: "🍽" },
  { id: "hebergement", label: "Hébergement", emoji: "🏨" },
  { id: "education", label: "Éducation", emoji: "🏫" },
  { id: "entreprises", label: "Entreprises", emoji: "🏢" },
  { id: "collectivites", label: "Collectivités", emoji: "🏛" },
];

const offerOptions = [
  "Petit-déjeuner",
  "Déjeuner",
  "Traiteur",
  "Événementiel",
  "Viennoiseries",
  "Pain bio",
  "Goûter",
  "Pain artisanal",
];

const ProspectsPage = () => {
  const [selectedCategories, setSelectedCategories] = useState<CategoryFilterType[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    responses: true,
    inProgress: true,
    finished: false,
  });
  const [selectedProspect, setSelectedProspect] = useState<ProspectDetail | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [handledProspects, setHandledProspects] = useState<Record<string, string>>({});
  const { showToast } = useCustomToast();

  const toggleCategory = (cat: CategoryFilterType) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleOffer = (offer: string) => {
    setSelectedOffers((prev) =>
      prev.includes(offer) ? prev.filter((o) => o !== offer) : [...prev, offer]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedOffers([]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedOffers.length > 0;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMarkAsHandled = (prospectId: string) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    setHandledProspects((prev) => ({ ...prev, [prospectId]: formattedDate }));
    showToast("success", "Bien noté ! On croise les doigts pour qu'une belle commande soit passée !");
  };

  const handleMarkAsUnhandled = (prospectId: string) => {
    setHandledProspects((prev) => {
      const updated = { ...prev };
      delete updated[prospectId];
      return updated;
    });
  };

  const handleCardClick = (prospect: Prospect) => {
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

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    showToast("success", "Données actualisées !");
  }, [showToast]);

  // Filter prospects
  const filteredProspects = mockProspects.filter((p) => {
    const catMatch = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const offerMatch = selectedOffers.length === 0 || p.offers.some((o) => selectedOffers.includes(o));
    return catMatch && offerMatch;
  });

  // Sort by date (most recent first), then by stage order
  const stageOrder: Record<string, number> = { initial: 0, relance: 1, response: 2, finished: 3 };
  const sortProspects = (a: Prospect, b: Prospect) => {
    const dateA = a.lastSentDate;
    const dateB = b.lastSentDate;
    // Parse French dates for comparison (dd mmm. yyyy)
    const parseDate = (d: string) => {
      const months: Record<string, number> = { "jan.": 0, "fév.": 1, "mar.": 2, "avr.": 3, "mai": 4, "jun.": 5, "jui.": 6, "aoû.": 7, "sep.": 8, "oct.": 9, "nov.": 10, "déc.": 11 };
      const parts = d.split(" ");
      return new Date(parseInt(parts[2]), months[parts[1]] ?? 0, parseInt(parts[0]));
    };
    const timeDiff = parseDate(dateB).getTime() - parseDate(dateA).getTime();
    if (timeDiff !== 0) return timeDiff;
    // Same date: sort by stage order then currentStep
    const orderDiff = (stageOrder[a.stageType] ?? 99) - (stageOrder[b.stageType] ?? 99);
    if (orderDiff !== 0) return orderDiff;
    return a.currentStep - b.currentStep;
  };

  const responseProspects = filteredProspects.filter((p) => p.status === "response").sort(sortProspects);
  const inProgressProspects = filteredProspects.filter((p) => p.status === "in_progress").sort(sortProspects);
  const finishedProspects = filteredProspects.filter((p) => p.status === "finished").sort(sortProspects);
  
  // Count unhandled responses for badge
  const unhandledResponseCount = responseProspects.filter(
    (p) => !handledProspects[p.id]
  ).length;

  return (
    <div className="min-h-screen bg-background pb-20 page-transition">
      <Header notificationCount={responseProspects.length} />

      {/* Hero KPI Banner */}
      <div className="mx-4 mt-3 mb-1">
        <div className="bg-primary rounded-xl px-5 py-4 text-primary-foreground flex items-center justify-evenly">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold">12</span>
            <span className="text-xs opacity-80">emails envoyés</span>
          </div>
          <div className="w-px h-9 bg-primary-foreground/20" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold">5</span>
            <span className="text-xs opacity-80">prospects</span>
          </div>
          <div className="w-px h-9 bg-primary-foreground/20" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold">3</span>
            <span className="text-xs opacity-80">relances</span>
          </div>
        </div>
      </div>

      {/* Filters - Notion style */}
      <div className="sticky top-14 bg-background z-40 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 px-4">
          <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />

          {/* Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors min-h-[36px]",
              selectedCategories.length > 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/40"
            )}>
              Catégorie
              {selectedCategories.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
                  {selectedCategories.length}
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-primary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
              {categoryOptions.map((cat) => (
                <DropdownMenuCheckboxItem
                  key={cat.id}
                  checked={selectedCategories.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                  onSelect={(e) => e.preventDefault()}
                >
                  <span className="mr-1.5">{cat.emoji}</span>
                  {cat.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Offer Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors min-h-[36px]",
              selectedOffers.length > 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/40"
            )}>
              Panier
              {selectedOffers.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
                  {selectedOffers.length}
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-primary" />
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
              {offerOptions.map((offer) => (
                <DropdownMenuCheckboxItem
                  key={offer}
                  checked={selectedOffers.includes(offer)}
                  onCheckedChange={() => toggleOffer(offer)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {offer}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Active filter tags - Notion style */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 px-4 pt-2">
            {selectedCategories.map((catId) => {
              const cat = categoryOptions.find((c) => c.id === catId);
              return (
                <span
                  key={catId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
                >
                  {cat?.emoji} {cat?.label}
                  <button onClick={() => toggleCategory(catId)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
            {selectedOffers.map((offer) => (
              <span
                key={offer}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium"
              >
                {offer}
                <button onClick={() => toggleOffer(offer)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content with Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh} className="h-[calc(100vh-200px)]">
        <main className="py-5">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:px-4">
            {/* Responses Section */}
            <ProspectSection
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Réponses reçues"
              count={unhandledResponseCount}
              totalCount={responseProspects.length}
              isExpanded={expandedSections.responses}
              onToggle={() => toggleSection("responses")}
              variant="success"
              prospects={responseProspects}
              onCardClick={handleCardClick}
              showResponseAction
              handledProspects={handledProspects}
              onMarkAsHandled={handleMarkAsHandled}
              onMarkAsUnhandled={handleMarkAsUnhandled}
            />

            {/* In Progress Section */}
            <ProspectSection
              icon={<Send className="h-5 w-5" />}
              title="En cours de prospection"
              count={inProgressProspects.length}
              totalCount={inProgressProspects.length}
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
              totalCount={finishedProspects.length}
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
      </PullToRefresh>

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
    {[1, 2, 3].map((section) => (
      <div key={section} className="space-y-3">
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
        {[1, 2].map((card) => (
          <ProspectCardSkeleton key={`${section}-${card}`} />
        ))}
      </div>
    ))}
  </div>
);

// Prospect Section Component
interface ProspectSectionProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  totalCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  variant: "success" | "default" | "muted";
  prospects: Prospect[];
  onCardClick: (prospect: Prospect) => void;
  dimCards?: boolean;
  showResponseAction?: boolean;
  handledProspects?: Record<string, string>;
  onMarkAsHandled?: (id: string) => void;
  onMarkAsUnhandled?: (id: string) => void;
}

const ProspectSection: React.FC<ProspectSectionProps> = ({
  icon,
  title,
  count,
  totalCount,
  isExpanded,
  onToggle,
  variant,
  prospects,
  onCardClick,
  dimCards = false,
  showResponseAction = false,
  handledProspects = {},
  onMarkAsHandled,
  onMarkAsUnhandled,
}) => {
  if (totalCount === 0) return null;

  const iconStyles = {
    success: "text-success",
    default: "text-primary",
    muted: "text-muted-foreground",
  };

  return (
    <div className="flex flex-col">
      {/* Section Header - Notion style */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-all duration-200 hover:bg-muted/50 rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span className={cn("opacity-70", iconStyles[variant])}>{icon}</span>
          <span className="text-sm font-semibold text-foreground tracking-tight">{title}</span>
          <span
            className={cn(
              "px-1.5 py-0.5 rounded text-xs font-medium",
              variant === "success"
                ? "bg-destructive text-destructive-foreground"
                : "text-muted-foreground"
            )}
          >
            {count}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Section Content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
          "md:max-h-none md:opacity-100"
        )}
      >
        <div className={cn("px-4 py-3 space-y-3", dimCards && "opacity-60")}>
          {prospects.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              name={prospect.name}
              stage={prospect.stage}
              stageType={prospect.stageType}
              currentStep={prospect.currentStep}
              totalSteps={prospect.totalSteps}
              context={prospect.context}
              offers={prospect.offers}
              lastSentDate={prospect.lastSentDate}
              isNew={prospect.isNew}
              onClick={() => onCardClick(prospect)}
              showResponseAction={showResponseAction}
              isHandled={!!handledProspects[prospect.id]}
              handledDate={handledProspects[prospect.id]}
              onMarkAsHandled={() => onMarkAsHandled?.(prospect.id)}
              onMarkAsUnhandled={() => onMarkAsUnhandled?.(prospect.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProspectsPage;
