import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { ProspectCard, StageType } from "@/components/ProspectCard";
import { ProspectDetailSheet, ProspectDetail } from "@/components/ProspectDetailSheet";
import { CategoryType } from "@/components/ui/badge-category";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronDown,
  ChevronUp,
  ShoppingBasket,
  Rocket,
  Store,
  MessageCircle,
  UtensilsCrossed,
  Bed,
  GraduationCap,
  Building2,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { KpiPanel } from "@/components/ui/kpi-panel";

// Basket detail types (kept as mock — backend doesn't expose basket items yet)
interface BasketItem {
  name: string;
  quantity: number;
  unitPriceHT: number;
}

interface BasketDetail {
  name: string;
  items: BasketItem[];
  tvaRate: number;
}

const mockBasketDetails: Record<string, BasketDetail> = {
  "Petit-déjeuner": {
    name: "Petit-déjeuner",
    items: [
      { name: "Croissant pur beurre", quantity: 10, unitPriceHT: 1.20 },
      { name: "Pain au chocolat", quantity: 10, unitPriceHT: 1.30 },
      { name: "Baguette tradition", quantity: 5, unitPriceHT: 1.10 },
      { name: "Confiture artisanale (pot)", quantity: 3, unitPriceHT: 3.50 },
    ],
    tvaRate: 0.055,
  },
  "Goûter": {
    name: "Goûter",
    items: [
      { name: "Madeleine", quantity: 20, unitPriceHT: 0.80 },
      { name: "Cookie chocolat", quantity: 15, unitPriceHT: 1.00 },
      { name: "Brownie", quantity: 10, unitPriceHT: 1.50 },
    ],
    tvaRate: 0.055,
  },
  "Traiteur": {
    name: "Traiteur",
    items: [
      { name: "Mini sandwich", quantity: 20, unitPriceHT: 2.50 },
      { name: "Quiche individuelle", quantity: 10, unitPriceHT: 3.00 },
      { name: "Salade composée", quantity: 8, unitPriceHT: 4.50 },
      { name: "Mignardises (lot de 4)", quantity: 15, unitPriceHT: 3.80 },
    ],
    tvaRate: 0.10,
  },
  "Pain bio": {
    name: "Pain bio",
    items: [
      { name: "Pain complet bio", quantity: 8, unitPriceHT: 3.20 },
      { name: "Pain aux céréales bio", quantity: 6, unitPriceHT: 3.50 },
      { name: "Pain de seigle bio", quantity: 4, unitPriceHT: 3.80 },
    ],
    tvaRate: 0.055,
  },
  "Viennoiseries": {
    name: "Viennoiseries",
    items: [
      { name: "Croissant", quantity: 15, unitPriceHT: 1.10 },
      { name: "Pain au chocolat", quantity: 15, unitPriceHT: 1.20 },
      { name: "Chausson aux pommes", quantity: 10, unitPriceHT: 1.40 },
      { name: "Pain aux raisins", quantity: 10, unitPriceHT: 1.30 },
    ],
    tvaRate: 0.055,
  },
};

const categoryLucideMap: Record<string, LucideIcon> = {
  "Restauration": UtensilsCrossed,
  "Hébergement": Bed,
  "Éducation": GraduationCap,
  "Entreprises": Building2,
  "Collectivités": Landmark,
};

// Map raw category name to internal CategoryType for ProspectCard
const mapCategoryType = (name?: string | null): { id: CategoryType; label: string } => {
  const n = (name ?? "").toLowerCase();
  if (n.startsWith("restaur")) return { id: "restauration", label: "Restaurant" };
  if (n.startsWith("héberg") || n.startsWith("heberg")) return { id: "hebergement", label: "Hébergement" };
  if (n.startsWith("éduc") || n.startsWith("educ")) return { id: "education", label: "Éducation" };
  if (n.startsWith("entrep") || n.startsWith("profess")) return { id: "entreprises", label: "Entreprise" };
  if (n.startsWith("collectiv")) return { id: "collectivites", label: "Collectivité" };
  return { id: "entreprises", label: name || "Entreprise" };
};

const formatFrDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

type DashboardPeriodFilter = "all" | "week" | "month" | "quarter";

const dashboardPeriodLabels: Record<DashboardPeriodFilter, string> = {
  all: "Tout",
  week: "Cette semaine",
  month: "Ce mois",
  quarter: "Ce trimestre",
};

const getPeriodStart = (period: DashboardPeriodFilter): Date | null => {
  if (period === "all") return null;
  const now = new Date();
  if (period === "week") {
    const d = new Date(now);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const q = Math.floor(now.getMonth() / 3);
  return new Date(now.getFullYear(), q * 3, 1);
};

// Live row from Supabase
interface CampaignProspectRow {
  id: string;
  prospect_id?: string | null;
  status: string;
  current_step: number | null;
  created_at: string | null;
  last_sent_at: string | null;
  campaign_id?: string | null;
  prospect: {
    name: string | null;
    city: string | null;
    offer: string | null;
    bakery_id?: string | null;
    category: { name: string | null } | null;
  } | null;
}

interface CampaignRow {
  id: string;
  status: string;
  instantly_campaign_id: string | null;
  bakery_id: string | null;
}

interface BakeryRow {
  id: string;
  name: string;
}

// Prospect for KPI BottomSheet
interface DashboardProspect {
  id: string;
  campaignId: string;
  prospectId: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  stage: string;
  stageType: StageType;
  currentStep: number;
  campaignCurrentStep: number;
  totalSteps: number;
  context: string;
  offers: string[];
  lastSentDate: string;
  responseReceivedAt?: string | null;
  status: "response" | "contacted";
}

const buildStage = (status: string, currentStep: number | null): { stage: string; stageType: StageType; currentStep: number } => {
  const step = currentStep ?? 0;
  const stepLabels: Record<number, string> = {
    0: "Premier contact",
    1: "Premier contact",
    2: "Relance 1",
    3: "Relance 2",
    4: "Relance 3",
    5: "Dernier message",
  };
  if (status === "replied") {
    return { stage: "Réponse reçue", stageType: "response", currentStep: Math.max(step, 1) };
  }
  if (status === "completed_no_reply" || status === "finished") {
    return { stage: "Terminé", stageType: "finished", currentStep: 5 };
  }
  if (step <= 1) return { stage: stepLabels[step], stageType: "initial", currentStep: 1 };
  return { stage: stepLabels[step] ?? `Relance ${step - 1}`, stageType: "relance", currentStep: step };
};

const DashboardPage = () => {
  const [isOffersOpen, setIsOffersOpen] = useState(true);
  const [selectedBakeryId, setSelectedBakeryId] = useState<string | null>(null);
  const [selectedBasket, setSelectedBasket] = useState<BasketDetail | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriodFilter>("all");
  const [kpiSheetType, setKpiSheetType] = useState<"responses" | "contacted" | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<ProspectDetail | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const [campaignProspects, setCampaignProspects] = useState<CampaignProspectRow[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [bakeries, setBakeries] = useState<BakeryRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live data
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [{ data: cpData }, { data: cData }, { data: bData }] = await Promise.all([
        supabase
          .from("campaign_prospects")
          .select(`
            id, prospect_id, status, current_step, created_at, last_sent_at, campaign_id,
            prospect:prospects ( name, city, offer, bakery_id, category:prospect_categories(name) )
          `),
        supabase.from("campaigns").select("id, status, instantly_campaign_id, bakery_id"),
        supabase.from("bakeries").select("id, name"),
      ]);
      if (cancelled) return;
      setCampaignProspects((cpData ?? []) as unknown as CampaignProspectRow[]);
      setCampaigns((cData ?? []) as CampaignRow[]);
      setBakeries((bData ?? []) as BakeryRow[]);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Apply client-side filters (period + bakery)
  const periodStart = useMemo(() => getPeriodStart(selectedPeriod), [selectedPeriod]);
  const campaignBakeryMap = useMemo(() => {
    const m = new Map<string, string | null>();
    campaigns.forEach((c) => m.set(c.id, c.bakery_id));
    return m;
  }, [campaigns]);

  const filteredProspects = useMemo(() => {
    return campaignProspects.filter((cp) => {
      const periodOk = !periodStart || (cp.last_sent_at ? new Date(cp.last_sent_at).getTime() >= periodStart.getTime() : false);
      const bakeryId = cp.prospect?.bakery_id ?? campaignBakeryMap.get(cp.campaign_id ?? "") ?? null;
      const bakeryOk = !selectedBakeryId || bakeryId === selectedBakeryId;
      return periodOk && bakeryOk;
    });
  }, [campaignProspects, periodStart, selectedBakeryId, campaignBakeryMap]);

  // Derived KPIs
  const kpis = useMemo(() => {
    const responses = filteredProspects.filter((cp) => cp.status === "replied").length;
    const toContact = filteredProspects.filter((cp) => cp.status === "completed_no_reply").length;
    const prospectsCount = filteredProspects.length;
    const emails = filteredProspects.filter((cp) => (cp.current_step ?? -1) >= 0 && cp.last_sent_at).length;
    const relances = filteredProspects.filter((cp) => (cp.current_step ?? 0) > 0).length;
    return { responses, toContact, prospects: prospectsCount, emails, relances };
  }, [filteredProspects]);

  // Top responding categories
  const topCategories = useMemo(() => {
    const counts = filteredProspects
      .filter((cp) => cp.status === "replied")
      .reduce<Record<string, number>>((acc, cp) => {
        const cat = cp.prospect?.category?.name ?? "Autre";
        acc[cat] = (acc[cat] ?? 0) + 1;
        return acc;
      }, {});
    return Object.entries(counts)
      .map(([name, responses]) => ({ name, responses }))
      .sort((a, b) => b.responses - a.responses);
  }, [filteredProspects]);

  // Offers (paniers)
  const offers = useMemo(() => {
    return Array.from(
      new Set(
        filteredProspects
          .map((cp) => cp.prospect?.offer)
          .filter((o): o is string => Boolean(o && o.trim()))
      )
    ).sort();
  }, [filteredProspects]);

  // Top-right pill counters
  const totalBakeries = bakeries.length;
  const activeCampaigns = campaigns.filter((c) => !!c.instantly_campaign_id).length;

  // Build prospects for KPI panels
  const buildDashboardProspect = (cp: CampaignProspectRow, status: "response" | "contacted"): DashboardProspect => {
    const cat = mapCategoryType(cp.prospect?.category?.name);
    const stageInfo = buildStage(cp.status, cp.current_step);
    const city = cp.prospect?.city ?? "";
    return {
      id: cp.id,
      campaignId: cp.campaign_id ?? "",
      prospectId: cp.prospect_id ?? "",
      name: cp.prospect?.name ?? "Prospect",
      category: cat.id,
      categoryLabel: cat.label,
      stage: stageInfo.stage,
      stageType: stageInfo.stageType,
      currentStep: stageInfo.currentStep,
      campaignCurrentStep: cp.current_step ?? 0,
      totalSteps: 5,
      context: city ? `${cat.label} — ${city}` : cat.label,
      offers: cp.prospect?.offer ? [cp.prospect.offer] : [],
      lastSentDate: formatFrDate(cp.last_sent_at),
      responseReceivedAt: null,
      status,
    };
  };

  const responseProspects = useMemo(
    () => filteredProspects.filter((cp) => cp.status === "replied").map((cp) => buildDashboardProspect(cp, "response")),
    [filteredProspects]
  );
  const toContactProspects = useMemo(
    () => filteredProspects.filter((cp) => cp.status === "completed_no_reply").map((cp) => buildDashboardProspect(cp, "contacted")),
    [filteredProspects]
  );

  const filterOptions: FilterOption[] = [
    { id: null, label: "Toutes mes boulangeries" },
    ...bakeries.map((b) => ({ id: b.id, label: b.name })),
  ];

  const isEmpty = !loading && campaignProspects.length === 0 && campaigns.length === 0;

  // Header sub-text
  const headerToContact = kpis.responses; // "Nouvelles réponses à traiter"

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header notificationCount={headerToContact} />

      {/* Page title */}
      <div className="bg-card px-6 py-4 text-center">
        <h1 className="text-2xl font-bold text-primary">Mon tableau de bord</h1>
        {(() => {
          if (isEmpty) return (
            <p className="text-sm text-muted-foreground mt-0.5">
              Aucune campagne active — <a href="/onboarding" className="underline hover:text-foreground transition-colors">lancez votre première prospection</a>
            </p>
          );
          if (headerToContact > 0) return (
            <p className="text-sm text-success mt-0.5">
              🎉 {headerToContact} nouvelle{headerToContact > 1 ? "s" : ""} réponse{headerToContact > 1 ? "s" : ""} à traiter
            </p>
          );
          if (activeCampaigns > 0) return (
            <p className="text-sm text-primary mt-0.5">
              Campagne en cours — {kpis.prospects} prospects contactés
            </p>
          );
          return (
            <p className="text-sm text-muted-foreground mt-0.5">
              Tout est traité — beau travail 👌
            </p>
          );
        })()}
      </div>

      <main className="px-4 py-6 max-w-5xl mx-auto">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <ActiveDashboard
            kpis={kpis}
            topCategories={topCategories}
            offers={offers}
            totalBakeries={totalBakeries}
            activeCampaigns={activeCampaigns}
            isOffersOpen={isOffersOpen}
            onToggleOffers={() => setIsOffersOpen(!isOffersOpen)}
            filterOptions={filterOptions}
            selectedBakeryId={selectedBakeryId}
            onBakeryChange={setSelectedBakeryId}
            onBasketClick={(name) => setSelectedBasket(mockBasketDetails[name] || { name, items: [], tvaRate: 0.055 })}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            kpiSheetType={kpiSheetType}
            onKpiSheetChange={setKpiSheetType}
            responseProspects={responseProspects}
            toContactProspects={toContactProspects}
            onProspectClick={(prospect) => {
              const detail: ProspectDetail = {
                id: prospect.id,
                campaignId: prospect.campaignId,
                prospectId: prospect.prospectId,
                name: prospect.name,
                category: prospect.category,
                categoryLabel: prospect.categoryLabel,
                hasResponse: prospect.status === "response",
                currentStage: prospect.stage,
                currentStageDate: prospect.lastSentDate,
                totalStages: prospect.totalSteps,
                completedStages: prospect.currentStep,
                currentStep: prospect.campaignCurrentStep,
                emailHistory: [],
              };
              setSelectedProspect(detail);
              setIsDetailSheetOpen(true);
            }}
          />
        )}
      </main>

      <BottomNavigation />

      {/* Basket Detail Sheet */}
      <BottomSheet isOpen={!!selectedBasket} onClose={() => setSelectedBasket(null)}>
        {selectedBasket && <BasketDetailContent basket={selectedBasket} />}
      </BottomSheet>

      {/* Prospect Detail Sheet */}
      <ProspectDetailSheet
        isOpen={isDetailSheetOpen}
        onClose={() => {
          setIsDetailSheetOpen(false);
          setTimeout(() => setSelectedProspect(null), 300);
        }}
        prospect={selectedProspect}
      />
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center text-center py-12 md:py-24">
    <div className="text-6xl mb-6">📬</div>
    <h2 className="text-xl font-semibold text-foreground mb-2">
      Prêt à développer ta clientèle pro ?
    </h2>
    <p className="text-muted-foreground mb-8 max-w-xs">
      Lance ta première campagne de prospection en quelques clics.
    </p>
    <Button fullWidth="mobile" size="lg">
      <Rocket className="h-5 w-5" />
      Lancer ma première campagne
    </Button>
  </div>
);

interface FilterOption {
  id: string | null;
  label: string;
}

interface ActiveDashboardProps {
  kpis: { responses: number; toContact: number; prospects: number; emails: number; relances: number };
  topCategories: { name: string; responses: number }[];
  offers: string[];
  totalBakeries: number;
  activeCampaigns: number;
  isOffersOpen: boolean;
  onToggleOffers: () => void;
  filterOptions: FilterOption[];
  selectedBakeryId: string | null;
  onBakeryChange: (id: string | null) => void;
  onBasketClick: (name: string) => void;
  selectedPeriod: DashboardPeriodFilter;
  onPeriodChange: (period: DashboardPeriodFilter) => void;
  kpiSheetType: "responses" | "contacted" | null;
  onKpiSheetChange: (type: "responses" | "contacted" | null) => void;
  responseProspects: DashboardProspect[];
  toContactProspects: DashboardProspect[];
  onProspectClick: (prospect: DashboardProspect) => void;
}

const ActiveDashboard: React.FC<ActiveDashboardProps> = ({
  kpis,
  topCategories,
  offers,
  totalBakeries,
  activeCampaigns,
  isOffersOpen,
  onToggleOffers,
  filterOptions,
  selectedBakeryId,
  onBakeryChange,
  onBasketClick,
  selectedPeriod,
  onPeriodChange,
  kpiSheetType,
  onKpiSheetChange,
  responseProspects,
  toContactProspects,
  onProspectClick,
}) => {
  const selectedBakery = filterOptions.find((o) => o.id === selectedBakeryId && o.id !== null);

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div className="rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] mx-auto p-4 max-w-md md:max-w-none w-full" style={{ background: '#F8F9FB' }}>
        {/* Unified filter bar */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 h-9 rounded-full text-sm font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors outline-none whitespace-nowrap">
              {dashboardPeriodLabels[selectedPeriod]}
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              {(["all", "week", "month", "quarter"] as DashboardPeriodFilter[]).map((period) => (
                <DropdownMenuItem
                  key={period}
                  onClick={() => onPeriodChange(period)}
                  className={cn("cursor-pointer text-sm", selectedPeriod === period && "bg-primary/10 text-primary font-medium")}
                >
                  {dashboardPeriodLabels[period]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 h-9 rounded-full text-sm font-medium bg-card border border-border text-foreground hover:bg-muted transition-colors outline-none whitespace-nowrap">
              <span className="truncate">
                {selectedBakery ? selectedBakery.label : "Toutes les boulangeries"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => onBakeryChange(null)}
                className={cn("cursor-pointer", selectedBakeryId === null && "bg-primary/10 text-primary font-medium")}
              >
                Toutes les boulangeries
              </DropdownMenuItem>
              {filterOptions.filter((o) => o.id !== null).map((option) => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => onBakeryChange(option.id)}
                  className={cn("cursor-pointer", selectedBakeryId === option.id && "bg-primary/10 text-primary")}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* KPI Cards */}
        <div className="space-y-3">
          {/* Zone 1 — Clickable KPI cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onKpiSheetChange("responses")}
              className="flex items-center rounded-xl border border-border shadow-sm p-4 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group border-l-4 border-l-success bg-success/5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-foreground">{kpis.responses}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Réponses reçues</p>
              </div>
              <ChevronDown className="h-4 w-4 text-success rotate-[-90deg] flex-shrink-0" />
            </button>

            <button
              onClick={() => onKpiSheetChange("contacted")}
              className="flex items-center rounded-xl border border-border shadow-sm p-4 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group border-l-4 border-l-amber-accent bg-[hsl(var(--amber-accent)/0.05)]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-foreground">{kpis.toContact}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Encore à contacter</p>
              </div>
              <ChevronDown className="h-4 w-4 text-amber-accent rotate-[-90deg] flex-shrink-0" />
            </button>
          </div>

          {/* Zone 2 — Blue card */}
          <div className="bg-primary rounded-xl px-2 py-3 text-primary-foreground -mx-1">
            <div className="flex items-stretch justify-between">
              <div className="flex flex-col items-center justify-center flex-1">
                <span className="text-[11px] text-primary-foreground/70 whitespace-nowrap mb-0.5">Nouveaux prospects</span>
                <span className="text-[28px] leading-tight font-bold">{kpis.prospects}</span>
              </div>
              <div className="w-px bg-primary-foreground/30 self-stretch" />
              <div className="flex flex-col items-center justify-center flex-1">
                <span className="text-[11px] text-primary-foreground/70 whitespace-nowrap mb-0.5">Emails envoyés</span>
                <span className="text-[28px] leading-tight font-bold">{kpis.emails}</span>
              </div>
              <div className="w-px bg-primary-foreground/30 self-stretch" />
              <div className="flex flex-col items-center justify-center flex-1">
                <span className="text-[11px] text-primary-foreground/70 whitespace-nowrap mb-0.5">Relances</span>
                <span className="text-[28px] leading-tight font-bold">{kpis.relances}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === Desktop: 2-column grid / Mobile: single column === */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-7 space-y-5">
          {/* Top Responding Categories */}
          {topCategories.length > 0 && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-4">
              <h3 className="font-medium text-foreground mb-3 text-sm">Catégories qui ont le plus répondu</h3>
              <div className="space-y-3">
                {topCategories.map((category) => {
                  const maxResponses = Math.max(...topCategories.map((c) => c.responses));
                  const barWidth = maxResponses > 0 ? (category.responses / maxResponses) * 100 : 0;
                  return (
                    <div key={category.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const CatIcon = categoryLucideMap[category.name];
                            return CatIcon ? <CatIcon className="h-3.5 w-3.5 text-muted-foreground" /> : null;
                          })()}
                          <span className="text-sm text-foreground">{category.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{category.responses}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden ml-[18px]">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-primary"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column — Pills + Paniers */}
        <div className="md:col-span-5 space-y-5">
          {/* Campaign Status pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
              <Store className="h-3.5 w-3.5" />
              {totalBakeries} boulangerie{totalBakeries > 1 ? 's' : ''}
            </span>
            {activeCampaigns > 0 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success/10 text-success">
                {activeCampaigns} campagne{activeCampaigns > 1 ? 's' : ''} active{activeCampaigns > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                Aucune campagne
              </span>
            )}
          </div>

          {offers.length > 0 && (
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <button
                onClick={onToggleOffers}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium text-foreground text-sm">Mes paniers</span>
                {isOffersOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isOffersOpen && (
                <div className="px-4 pb-3 space-y-2">
                  {offers.map((offer) => (
                    <button
                      key={offer}
                      onClick={() => onBasketClick(offer)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all group active:scale-[0.98]"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <ShoppingBasket className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium text-foreground flex-1">{offer}</span>
                      <ChevronDown className="h-4 w-4 text-primary/60 -rotate-90 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}

                  {/* Contact Hogust CTA */}
                  <div className="pt-2 border-t border-border mt-2">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      Contacter Hogust pour modifier mes paniers
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Panel — bottom on mobile, right on desktop */}
      <KpiPanel
        isOpen={!!kpiSheetType}
        onClose={() => onKpiSheetChange(null)}
        title={kpiSheetType === "responses" ? "Réponses reçues" : "Encore à contacter"}
      >
        <div className="space-y-3">
          {(kpiSheetType === "responses" ? responseProspects : toContactProspects).map((prospect) => (
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
              isNew={(() => {
                if (!prospect.responseReceivedAt) return false;
                const d = new Date(prospect.responseReceivedAt);
                return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
              })()}
              onClick={() => {
                onKpiSheetChange(null);
                onProspectClick(prospect);
              }}
            />
          ))}
          {(kpiSheetType === "responses" ? responseProspects : toContactProspects).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun prospect dans cette catégorie.</p>
          )}
        </div>
      </KpiPanel>
    </div>
  );
};

// Basket Detail Content
const BasketDetailContent: React.FC<{ basket: BasketDetail }> = ({ basket }) => {
  return (
    <div className="px-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
          <ShoppingBasket className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{basket.name}</h2>
          <p className="text-xs text-muted-foreground">{basket.items.length} produit{basket.items.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Items */}
      {basket.items.length > 0 ? (
        <div className="space-y-0 border border-border rounded-xl overflow-hidden">
          {basket.items.map((item, i) => (
            <div
              key={item.name}
              className={cn(
                "px-3 py-2.5 text-sm",
                i % 2 === 0 ? "bg-card" : "bg-muted/20"
              )}
            >
              <span className="text-foreground font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Détails du panier non disponibles.</p>
      )}
    </div>
  );
};

export default DashboardPage;
