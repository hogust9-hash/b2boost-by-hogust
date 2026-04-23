import * as React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ProspectCard, StageType } from "@/components/ProspectCard";
import { ProspectDetailSheet, ProspectDetail } from "@/components/ProspectDetailSheet";
import { ProspectCardSkeleton } from "@/components/ui/skeleton-card";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { useCustomToast } from "@/components/ui/custom-toast";
import { CategoryType } from "@/components/ui/badge-category";
import { useCampaignProspects, CampaignProspect } from "@/hooks/useCampaignProspects";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp, CheckCircle2, Send, Clock, X, Filter, CalendarDays, LayoutGrid, SlidersHorizontal, UtensilsCrossed, Bed, GraduationCap, Building2, Landmark, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Helper: check if a date is less than 7 days ago
const isWithinOneWeek = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return diffMs >= 0 && diffMs < 7 * 24 * 60 * 60 * 1000;
};

type Prospect = CampaignProspect;

type CategoryFilterType = CategoryType;

const categoryOptions: { id: CategoryFilterType; label: string; icon: LucideIcon }[] = [
  { id: "restauration", label: "Restauration", icon: UtensilsCrossed },
  { id: "hebergement", label: "Hébergement", icon: Bed },
  { id: "education", label: "Éducation", icon: GraduationCap },
  { id: "entreprises", label: "Entreprises", icon: Building2 },
  { id: "collectivites", label: "Collectivités", icon: Landmark },
];

type PeriodFilter = "all" | "week" | "month" | "quarter";

const periodLabels: Record<PeriodFilter, string> = {
  all: "Tout",
  week: "Cette semaine",
  month: "Ce mois",
  quarter: "Ce trimestre",
};

const getPeriodStart = (period: PeriodFilter): Date | null => {
  if (period === "all") return null;
  const now = new Date();
  if (period === "week") {
    const d = new Date(now);
    const day = d.getDay(); // 0=Sun
    const diff = (day === 0 ? -6 : 1 - day); // Monday as start
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  // quarter
  const q = Math.floor(now.getMonth() / 3);
  return new Date(now.getFullYear(), q * 3, 1);
};

const ProspectsPage = () => {
  const { prospects: liveProspects, loading: prospectsLoading } = useCampaignProspects();
  const [bakeries, setBakeries] = useState<{ id: string; label: string }[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("all");
  const [selectedCategories, setSelectedCategories] = useState<CategoryFilterType[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [selectedBakeries, setSelectedBakeries] = useState<string[]>([]);
  const [cardFilter, setCardFilter] = useState<"all" | "todo">("all");
  const isLoading = prospectsLoading;
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

  // Load bakeries (RLS scopes to current user)
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("bakeries")
      .select("id, name")
      .then(({ data }) => {
        if (cancelled) return;
        setBakeries((data ?? []).map((b: any) => ({ id: b.id, label: b.name })));
      });
    return () => { cancelled = true; };
  }, []);

  // Derive offer options from loaded prospects
  const offerOptions = useMemo(() => {
    return Array.from(
      new Set(
        liveProspects
          .map((p) => p.offer)
          .filter((o): o is string => Boolean(o && o.trim()))
      )
    ).sort();
  }, [liveProspects]);


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
    setSelectedPeriod("all");
    setCardFilter("all");
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedOffers.length > 0 || selectedBakeries.length > 0 || cardFilter !== "all" || selectedPeriod !== "all";

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

  // Filter prospects (cumulative: category + offer + bakery + period)
  const periodStart = useMemo(() => getPeriodStart(selectedPeriod), [selectedPeriod]);
  const filteredProspects = liveProspects.filter((p) => {
    const catMatch = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const offerMatch =
      selectedOffers.length === 0 || (p.offer ? selectedOffers.includes(p.offer) : false);
    const bakeryMatch =
      selectedBakeries.length === 0 || (p.bakeryId ? selectedBakeries.includes(p.bakeryId) : false);
    const periodMatch =
      !periodStart ||
      (p.lastSentAt ? new Date(p.lastSentAt).getTime() >= periodStart.getTime() : false);
    return catMatch && offerMatch && bakeryMatch && periodMatch;
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

      {/* Page title */}
      <div className="bg-card px-6 py-4 text-center">
        <h1 className="text-2xl font-bold text-primary">Mes prospects</h1>
        {unhandledResponseCount > 0 ? (
          <p className="text-sm text-success mt-0.5">
            {unhandledResponseCount} nouvelle{unhandledResponseCount > 1 ? "s" : ""} réponse{unhandledResponseCount > 1 ? "s" : ""} à traiter
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-0.5">
            Tout est à jour — {inProgressProspects.length} prospect{inProgressProspects.length > 1 ? "s" : ""} en cours de prospection
          </p>
        )}
      </div>

      <div className="sticky top-14 bg-background z-40 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 px-4 overflow-x-auto scrollbar-hide">
          {/* Period chip */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
              selectedPeriod !== "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}>
              {periodLabels[selectedPeriod]}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              {(["all", "week", "month", "quarter"] as PeriodFilter[]).map((period) => (
                <DropdownMenuItem
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn("cursor-pointer text-sm", selectedPeriod === period && "bg-primary/10 text-primary font-medium")}
                >
                  {periodLabels[period]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Card filter chip */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
              cardFilter !== "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}>
              {cardFilter === "all" ? "Fiche" : "Ma to-do"}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              <DropdownMenuItem onClick={() => setCardFilter("all")} className={cn("cursor-pointer text-sm", cardFilter === "all" && "bg-primary/10 text-primary font-medium")}>
                Toutes mes fiches
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCardFilter("todo")} className={cn("cursor-pointer text-sm", cardFilter === "todo" && "bg-primary/10 text-primary font-medium")}>
                Ma to-do
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bakery chip */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
              selectedBakeries.length > 0
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}>
              Boulangerie
              {selectedBakeries.length > 0 && (
                <span className="bg-primary-foreground text-primary rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
                  {selectedBakeries.length}
                </span>
              )}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
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

          {/* + Filtres chip (groups Panier & Catégorie) */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
              (selectedOffers.length > 0 || selectedCategories.length > 0)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            )}>
              <SlidersHorizontal className="h-3 w-3" />
              + Filtres
              {(selectedOffers.length + selectedCategories.length) > 0 && (
                <span className="bg-primary-foreground text-primary rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
                  {selectedOffers.length + selectedCategories.length}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[220px] max-h-[320px] overflow-y-auto">
              <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Catégorie</div>
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
              <div className="px-2 py-1.5 mt-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-t border-border">Panier</div>
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
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content with Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh} className="h-[calc(100vh-200px)]">
        <main className="py-5">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 md:px-4">
            {/* Responses Section (or To-do filtered) */}
            {(() => {
              const todoProspects = cardFilter === "todo"
                ? responseProspects.filter((p) => !handledProspects[p.id])
                : responseProspects;
              const todoUnhandled = todoProspects.filter((p) => !handledProspects[p.id]).length;
              return (
                <ProspectSection
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  title={cardFilter === "todo" ? "Ma to-do" : "Réponses reçues"}
                  count={todoUnhandled}
                  totalCount={todoProspects.length}
                  isExpanded={expandedSections.responses}
                  onToggle={() => toggleSection("responses")}
                  variant="success"
                  prospects={todoProspects}
                  onCardClick={handleCardClick}
                  showResponseAction
                  handledProspects={handledProspects}
                  onMarkAsHandled={handleMarkAsHandled}
                  onMarkAsUnhandled={handleMarkAsUnhandled}
                  calledProspects={calledProspects}
                  onToggleCalled={handleToggleCalled}
                />
              );
            })()}

            {/* In Progress Section - hidden in todo mode */}
            {cardFilter === "all" && (
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
            )}

            {/* Finished Section - hidden in todo mode */}
            {cardFilter === "all" && (
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
                compactCards
                reassuranceMessage="C'est normal — le taux de réponse moyen en prospection est de 15 à 25%."
              />
            )}
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
  compactCards?: boolean;
  reassuranceMessage?: string;
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
  compactCards = false,
  reassuranceMessage,
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

  const borderStyles = {
    success: "border-t-[3px] border-t-success",
    default: "border-t-[3px] border-t-primary",
    muted: "border-t-[3px] border-t-border",
  };

  return (
    <div className={cn("flex flex-col rounded-lg overflow-hidden", borderStyles[variant])}>
      {/* Section Header - Notion style */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-all duration-200 hover:bg-muted/50 rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span className={cn("opacity-70", iconStyles[variant])}>{icon}</span>
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-foreground tracking-tight">{title}</span>
            {reassuranceMessage && (
              <span className="text-[10px] text-muted-foreground font-normal leading-tight">{reassuranceMessage}</span>
            )}
          </div>
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
        <div className={cn("px-4 py-3", compactCards ? "space-y-1.5" : "space-y-3", dimCards && "opacity-60")}>
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
              isNew={isWithinOneWeek(prospect.responseReceivedAt)}
              onClick={() => onCardClick(prospect)}
              compact={compactCards}
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
