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
import { ChevronDown, ChevronUp, CheckCircle2, Send, Clock, X, Filter, UtensilsCrossed, Bed, GraduationCap, Building2, Landmark, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Prospect {
  id: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  bakery: string;
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

const bakeryOptions = [
  { id: "boulangerie-du-centre", label: "Boulangerie du Centre" },
  { id: "au-pain-dore", label: "Au Pain Doré" },
  { id: "la-mie-caline", label: "La Mie Câline" },
];

// Mock data with new structure
const mockProspects: Prospect[] = [
  { id: "1", name: "Restaurant Le Gourmet", category: "restauration", categoryLabel: "Restaurant", bakery: "boulangerie-du-centre", stage: "Réponse reçue", stageType: "response", currentStep: 3, totalSteps: 5, context: "Restaurant — Orléans, à 0.9 km", offers: ["Petit-déjeuner", "Déjeuner", "Traiteur", "Événementiel"], lastSentDate: "05 fév. 2026", isNew: true, status: "response" },
  { id: "2", name: "Hôtel & Spa Le Majestic", category: "hebergement", categoryLabel: "Hôtel", bakery: "au-pain-dore", stage: "Réponse reçue", stageType: "response", currentStep: 2, totalSteps: 5, context: "Hôtel — Orléans, à 1.4 km", offers: ["Viennoiseries", "Petit-déjeuner"], lastSentDate: "02 fév. 2026", isNew: false, status: "response" },
  { id: "3", name: "Lycée Jean Moulin", category: "education", categoryLabel: "Lycée", bakery: "la-mie-caline", stage: "Email initial", stageType: "initial", currentStep: 1, totalSteps: 5, context: "Lycée — Orléans, à 1.2 km", offers: ["Pain bio"], lastSentDate: "01 fév. 2026", isNew: false, status: "in_progress" },
  { id: "4", name: "TechCorp Solutions", category: "entreprises", categoryLabel: "Entreprise", bakery: "boulangerie-du-centre", stage: "Relance 2/5", stageType: "relance", currentStep: 2, totalSteps: 5, context: "Entreprise — Orléans, à 1.8 km", offers: ["Traiteur", "Petit-déjeuner", "Goûter"], lastSentDate: "28 jan. 2026", isNew: false, status: "in_progress" },
  { id: "5", name: "Mairie d'Orléans", category: "collectivites", categoryLabel: "Mairie", bakery: "au-pain-dore", stage: "Relance 1/5", stageType: "relance", currentStep: 1, totalSteps: 5, context: "Mairie — Orléans, à 0.6 km", offers: ["Événementiel"], lastSentDate: "25 jan. 2026", isNew: false, status: "in_progress" },
  { id: "6", name: "Bistrot du Marché", category: "restauration", categoryLabel: "Bistrot", bakery: "boulangerie-du-centre", stage: "Relance 3/5", stageType: "relance", currentStep: 3, totalSteps: 5, context: "Bistrot — Orléans, à 0.8 km", offers: ["Petit-déjeuner", "Déjeuner"], lastSentDate: "24 jan. 2026", isNew: false, status: "in_progress" },
  { id: "7", name: "Résidence Les Jardins", category: "hebergement", categoryLabel: "Résidence", bakery: "la-mie-caline", stage: "Email initial", stageType: "initial", currentStep: 1, totalSteps: 5, context: "Résidence — Orléans, à 1.7 km", offers: ["Goûter"], lastSentDate: "23 jan. 2026", isNew: false, status: "in_progress" },
  { id: "8", name: "Coworking L'Atelier", category: "entreprises", categoryLabel: "Coworking", bakery: "au-pain-dore", stage: "Relance 1/5", stageType: "relance", currentStep: 1, totalSteps: 5, context: "Coworking — Orléans, à 0.4 km", offers: ["Petit-déjeuner"], lastSentDate: "22 jan. 2026", isNew: false, status: "in_progress" },
  { id: "9", name: "École Montessori", category: "education", categoryLabel: "École", bakery: "boulangerie-du-centre", stage: "Relance 2/5", stageType: "relance", currentStep: 2, totalSteps: 5, context: "École — Orléans, à 1.3 km", offers: ["Goûter", "Pain bio"], lastSentDate: "21 jan. 2026", isNew: false, status: "in_progress" },
  { id: "10", name: "La Table d'Arthur", category: "restauration", categoryLabel: "Restaurant", bakery: "la-mie-caline", stage: "Email initial", stageType: "initial", currentStep: 1, totalSteps: 5, context: "Restaurant — Orléans, à 1.1 km", offers: ["Pain artisanal", "Viennoiseries", "Petit-déjeuner"], lastSentDate: "20 jan. 2026", isNew: false, status: "in_progress" },
  { id: "11", name: "Café de la Place", category: "restauration", categoryLabel: "Café", bakery: "boulangerie-du-centre", stage: "Terminé", stageType: "finished", currentStep: 5, totalSteps: 5, context: "Café — Orléans, à 0.5 km", offers: ["Viennoiseries"], lastSentDate: "10 jan. 2026", isNew: false, status: "finished" },
  { id: "12", name: "Hôtel du Commerce", category: "hebergement", categoryLabel: "Hôtel", bakery: "au-pain-dore", stage: "Terminé", stageType: "finished", currentStep: 5, totalSteps: 5, context: "Hôtel — Orléans, à 1.9 km", offers: ["Petit-déjeuner"], lastSentDate: "08 jan. 2026", isNew: false, status: "finished" },
  { id: "13", name: "Centre Culturel", category: "collectivites", categoryLabel: "Centre culturel", bakery: "la-mie-caline", stage: "Terminé", stageType: "finished", currentStep: 5, totalSteps: 5, context: "Centre culturel — Orléans, à 1.5 km", offers: ["Événementiel", "Traiteur"], lastSentDate: "05 jan. 2026", isNew: false, status: "finished" },
];

type CategoryFilterType = CategoryType;

const categoryOptions: { id: CategoryFilterType; label: string; icon: LucideIcon }[] = [
  { id: "restauration", label: "Restauration", icon: UtensilsCrossed },
  { id: "hebergement", label: "Hébergement", icon: Bed },
  { id: "education", label: "Éducation", icon: GraduationCap },
  { id: "entreprises", label: "Entreprises", icon: Building2 },
  { id: "collectivites", label: "Collectivités", icon: Landmark },
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

type PeriodFilter = "week" | "month" | "quarter";

const periodLabels: Record<PeriodFilter, string> = {
  week: "Cette semaine",
  month: "Ce mois",
  quarter: "Ce trimestre",
};

// Per-bakery KPI data aligned with Dashboard mockBakeriesStats
const bakeryPeriodKpis: Record<string, Record<PeriodFilter, { emails: number; prospects: number; relances: number }>> = {
  "boulangerie-du-centre": {
    week: { emails: 5, prospects: 3, relances: 1 },
    month: { emails: 18, prospects: 10, relances: 5 },
    quarter: { emails: 47, prospects: 25, relances: 12 },
  },
  "au-pain-dore": {
    week: { emails: 5, prospects: 3, relances: 2 },
    month: { emails: 20, prospects: 10, relances: 4 },
    quarter: { emails: 62, prospects: 31, relances: 16 },
  },
  "la-mie-caline": {
    week: { emails: 2, prospects: 2, relances: 0 },
    month: { emails: 9, prospects: 5, relances: 2 },
    quarter: { emails: 23, prospects: 12, relances: 6 },
  },
};

const getFilteredKpis = (selectedBakeryIds: string[], period: PeriodFilter) => {
  const ids = selectedBakeryIds.length > 0
    ? selectedBakeryIds
    : Object.keys(bakeryPeriodKpis);
  return ids.reduce(
    (acc, id) => {
      const data = bakeryPeriodKpis[id];
      if (!data) return acc;
      acc.emails += data[period].emails;
      acc.prospects += data[period].prospects;
      acc.relances += data[period].relances;
      return acc;
    },
    { emails: 0, prospects: 0, relances: 0 }
  );
};

const ProspectsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("quarter");
  const [selectedCategories, setSelectedCategories] = useState<CategoryFilterType[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [selectedBakeries, setSelectedBakeries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    responses: true,
    inProgress: true,
    finished: false,
  });
  const [selectedProspect, setSelectedProspect] = useState<ProspectDetail | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [handledProspects, setHandledProspects] = useState<Record<string, string>>({});
  const [calledProspects, setCalledProspects] = useState<Set<string>>(new Set());
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

  const toggleBakery = (id: string) => {
    setSelectedBakeries((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedOffers([]);
    setSelectedBakeries([]);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedOffers.length > 0 || selectedBakeries.length > 0;

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

  const handleToggleCalled = (prospectId: string) => {
    setCalledProspects((prev) => {
      const next = new Set(prev);
      if (next.has(prospectId)) {
        next.delete(prospectId);
        // Also remove handled status
        setHandledProspects((prev) => {
          const updated = { ...prev };
          delete updated[prospectId];
          return updated;
        });
      } else {
        next.add(prospectId);
        // Auto-mark as handled with today's date
        const today = new Date();
        const formattedDate = today.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        setHandledProspects((prev) => ({ ...prev, [prospectId]: formattedDate }));
        showToast("success", "Prospect marqué comme contacté ! Il apparaît maintenant dans les réponses reçues.");
      }
      return next;
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
    const bakeryMatch = selectedBakeries.length === 0 || selectedBakeries.includes(p.bakery);
    return catMatch && offerMatch && bakeryMatch;
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

  const responseProspects = filteredProspects.filter((p) => p.status === "response" || calledProspects.has(p.id)).sort(sortProspects);
  const inProgressProspects = filteredProspects.filter((p) => p.status === "in_progress" && !calledProspects.has(p.id)).sort(sortProspects);
  const finishedProspects = filteredProspects.filter((p) => p.status === "finished" && !calledProspects.has(p.id)).sort(sortProspects);
  
  // Count unhandled responses for badge
  const unhandledResponseCount = responseProspects.filter(
    (p) => !handledProspects[p.id]
  ).length;

  return (
    <div className="min-h-screen bg-background pb-20 page-transition">
      <Header notificationCount={responseProspects.length} />

      {/* Hero KPI Banner */}
      <div className="mx-4 mt-3 mb-1">
        <div className="bg-primary rounded-xl px-5 py-3.5 text-primary-foreground">
          {/* Period selector inline */}
          <div className="mb-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-foreground/15 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/25 transition-colors outline-none">
                {periodLabels[selectedPeriod]}
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[160px]">
                {(["week", "month", "quarter"] as PeriodFilter[]).map((period) => (
                  <DropdownMenuItem
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      "cursor-pointer text-sm",
                      selectedPeriod === period && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    {periodLabels[period]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {(() => {
            const kpis = getFilteredKpis(selectedBakeries, selectedPeriod);
            return (
              <div className="flex items-center justify-evenly">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{kpis.emails}</span>
                  <span className="text-xs opacity-80">emails envoyés</span>
                </div>
                <div className="w-px h-9 bg-primary-foreground/20" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{kpis.prospects}</span>
                  <span className="text-xs opacity-80">prospects</span>
                </div>
                <div className="w-px h-9 bg-primary-foreground/20" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-bold">{kpis.relances}</span>
                  <span className="text-xs opacity-80">relances</span>
                </div>
              </div>
            );
          })()}
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
                  <cat.icon className="h-3.5 w-3.5 mr-1.5" />
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

          {/* Bakery Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors min-h-[36px]",
              selectedBakeries.length > 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary/40"
            )}>
              Boulangerie
              {selectedBakeries.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
                  {selectedBakeries.length}
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-primary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              {bakeryOptions.map((b) => (
                <DropdownMenuCheckboxItem
                  key={b.id}
                  checked={selectedBakeries.includes(b.id)}
                  onCheckedChange={() => toggleBakery(b.id)}
                  onSelect={(e) => e.preventDefault()}
                >
                  🏪 {b.label}
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
                  {cat && <cat.icon className="h-3 w-3" />} {cat?.label}
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
            {selectedBakeries.map((bakeryId) => {
              const b = bakeryOptions.find((o) => o.id === bakeryId);
              return (
                <span
                  key={bakeryId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground text-xs font-medium"
                >
                  🏪 {b?.label}
                  <button onClick={() => toggleBakery(bakeryId)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
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
              calledProspects={calledProspects}
              onToggleCalled={handleToggleCalled}
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
              calledProspects={calledProspects}
              onToggleCalled={handleToggleCalled}
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
        isCalled={selectedProspect ? calledProspects.has(selectedProspect.id) : false}
        onToggleCalled={selectedProspect ? () => handleToggleCalled(selectedProspect.id) : undefined}
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
  calledProspects?: Set<string>;
  onToggleCalled?: (id: string) => void;
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
  calledProspects = new Set(),
  onToggleCalled,
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
              "text-xs font-medium",
              variant === "success"
                ? "text-success"
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
              category={prospect.category}
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
              isCalled={calledProspects.has(prospect.id)}
              onToggleCalled={onToggleCalled ? () => onToggleCalled(prospect.id) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProspectsPage;
