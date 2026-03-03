import * as React from "react";
import { useState } from "react";
import { ProspectCard, StageType } from "@/components/ProspectCard";
import { CategoryType } from "@/components/ui/badge-category";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  Users, 
  TrendingUp, 
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

// Basket detail types
interface BasketItem {
  name: string;
  quantity: number;
  unitPriceHT: number;
}

interface BasketDetail {
  name: string;
  items: BasketItem[];
  tvaRate: number; // e.g. 0.055 for 5.5%
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

interface BakeryStats {
  id: string;
  name: string;
  responsesReceived: number;
  emailsSent: number;
  prospectsContacted: number;
  responseRate: number;
  campaignActive: boolean;
  campaignStartDate: string | null;
  offers: string[];
}

interface DashboardData {
  responsesReceived: number;
  emailsSent: number;
  prospectsContacted: number;
  responseRate: number;
  activeCampaigns: number;
  totalBakeries: number;
  offers: string[];
  topCategories: { name: string; responses: number; color: string }[];
}

// Mock data per bakery
const mockBakeriesStats: BakeryStats[] = [
  {
    id: "1",
    name: "Boulangerie du Centre",
    responsesReceived: 3,
    emailsSent: 47,
    prospectsContacted: 25,
    responseRate: 6.4,
    campaignActive: true,
    campaignStartDate: "15/01/2026",
    offers: ["Petit-déjeuner", "Goûter"],
  },
  {
    id: "2",
    name: "Au Pain Doré",
    responsesReceived: 5,
    emailsSent: 62,
    prospectsContacted: 31,
    responseRate: 8.1,
    campaignActive: true,
    campaignStartDate: "20/01/2026",
    offers: ["Traiteur", "Pain bio"],
  },
  {
    id: "3",
    name: "La Mie Câline",
    responsesReceived: 1,
    emailsSent: 23,
    prospectsContacted: 12,
    responseRate: 4.3,
    campaignActive: false,
    campaignStartDate: null,
    offers: ["Viennoiseries"],
  },
];

// Calculate cumulative data
const categoryLucideMap: Record<string, LucideIcon> = {
  "Restauration": UtensilsCrossed,
  "Hébergement": Bed,
  "Éducation": GraduationCap,
  "Entreprises": Building2,
  "Collectivités": Landmark,
};

const calculateCumulativeData = (bakeries: BakeryStats[]): DashboardData => {
  const totalResponses = bakeries.reduce((sum, b) => sum + b.responsesReceived, 0);
  const totalEmails = bakeries.reduce((sum, b) => sum + b.emailsSent, 0);
  const totalProspects = bakeries.reduce((sum, b) => sum + b.prospectsContacted, 0);
  const avgResponseRate = totalEmails > 0 ? (totalResponses / totalEmails) * 100 : 0;
  const activeCampaigns = bakeries.filter(b => b.campaignActive).length;
  const allOffers = [...new Set(bakeries.flatMap(b => b.offers))];

  // Mock top responding categories
  const topCategories = [
    { name: "Restauration", responses: 4, color: "#F97316" },
    { name: "Hébergement", responses: 3, color: "#8B5CF6" },
    { name: "Entreprises", responses: 2, color: "#3B82F6" },
  ];

  return {
    responsesReceived: totalResponses,
    emailsSent: totalEmails,
    prospectsContacted: totalProspects,
    responseRate: Math.round(avgResponseRate * 10) / 10,
    activeCampaigns,
    totalBakeries: bakeries.length,
    offers: allOffers,
    topCategories,
  };
};

const mockCumulativeData = calculateCumulativeData(mockBakeriesStats);

const emptyData: DashboardData = {
  responsesReceived: 0,
  emailsSent: 0,
  prospectsContacted: 0,
  responseRate: 0,
  activeCampaigns: 0,
  totalBakeries: 0,
  offers: [],
  topCategories: [],
};

type DashboardPeriodFilter = "all" | "week" | "month" | "quarter";

const dashboardPeriodLabels: Record<DashboardPeriodFilter, string> = {
  all: "Tout",
  week: "Cette semaine",
  month: "Ce mois",
  quarter: "Ce trimestre",
};

const dashboardBakeryPeriodKpis: Record<string, Record<DashboardPeriodFilter, { responses: number; emails: number; prospects: number; relances: number }>> = {
  "1": {
    all: { responses: 3, emails: 65, prospects: 35, relances: 18 },
    week: { responses: 1, emails: 5, prospects: 3, relances: 1 },
    month: { responses: 2, emails: 18, prospects: 10, relances: 5 },
    quarter: { responses: 3, emails: 47, prospects: 25, relances: 12 },
  },
  "2": {
    all: { responses: 5, emails: 85, prospects: 42, relances: 22 },
    week: { responses: 1, emails: 5, prospects: 3, relances: 2 },
    month: { responses: 3, emails: 20, prospects: 10, relances: 4 },
    quarter: { responses: 5, emails: 62, prospects: 31, relances: 16 },
  },
  "3": {
    all: { responses: 1, emails: 32, prospects: 18, relances: 9 },
    week: { responses: 0, emails: 2, prospects: 2, relances: 0 },
    month: { responses: 1, emails: 9, prospects: 5, relances: 2 },
    quarter: { responses: 1, emails: 23, prospects: 12, relances: 6 },
  },
};

const getDashboardKpis = (selectedBakeryId: string | null, period: DashboardPeriodFilter) => {
  const ids = selectedBakeryId ? [selectedBakeryId] : Object.keys(dashboardBakeryPeriodKpis);
  return ids.reduce(
    (acc, id) => {
      const data = dashboardBakeryPeriodKpis[id];
      if (!data) return acc;
      acc.responses += data[period].responses;
      acc.emails += data[period].emails;
      acc.prospects += data[period].prospects;
      acc.relances += data[period].relances;
      return acc;
    },
    { responses: 0, emails: 0, prospects: 0, relances: 0 }
  );
};

const DashboardPage = () => {
  const [isOffersOpen, setIsOffersOpen] = useState(true);
  const [selectedBakeryId, setSelectedBakeryId] = useState<string | null>(null);
  const [selectedBasket, setSelectedBasket] = useState<BasketDetail | null>(null);
  const [isEmpty] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriodFilter>("quarter");
  const [kpiSheetType, setKpiSheetType] = useState<"responses" | "contacted" | null>(null);
  
  // Get data based on selection
  const getData = (): DashboardData => {
    if (isEmpty) return emptyData;
    if (selectedBakeryId === null) return mockCumulativeData;
    
    const bakery = mockBakeriesStats.find(b => b.id === selectedBakeryId);
    if (!bakery) return mockCumulativeData;
    
    return {
      responsesReceived: bakery.responsesReceived,
      emailsSent: bakery.emailsSent,
      prospectsContacted: bakery.prospectsContacted,
      responseRate: bakery.responseRate,
      activeCampaigns: bakery.campaignActive ? 1 : 0,
      totalBakeries: 1,
      offers: bakery.offers,
      topCategories: [
        { name: "Restauration", responses: bakery.responsesReceived > 2 ? 2 : 1, color: "#F97316" },
        { name: "Hébergement", responses: 1, color: "#8B5CF6" },
      ],
    };
  };
  
  const data = getData();
  
  const filterOptions = [
    { id: null, label: "Toutes mes boulangeries" },
    ...mockBakeriesStats.map(b => ({ id: b.id, label: b.name })),
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header notificationCount={data.responsesReceived} />

      {/* Page title */}
      <div className="bg-card px-6 py-4 text-center">
        <h1 className="text-2xl font-bold text-primary">Mon tableau de bord</h1>
        {isEmpty ? (
          <p className="text-sm text-muted-foreground mt-0.5">
            Aucune campagne active — <a href="/onboarding" className="underline hover:text-foreground transition-colors">lancez votre première prospection</a>
          </p>
        ) : data.responsesReceived > 0 ? (
          <p className="text-sm text-success mt-0.5">
            🎉 {data.responsesReceived} nouvelle{data.responsesReceived > 1 ? "s" : ""} réponse{data.responsesReceived > 1 ? "s" : ""} à traiter
          </p>
        ) : data.activeCampaigns > 0 ? (
          <p className="text-sm text-primary mt-0.5">
            Campagne en cours — {data.prospectsContacted} prospects contactés
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-0.5">
            Tout est traité — beau travail 👌
          </p>
        )}
      </div>

      <main className="px-4 py-6 max-w-5xl mx-auto">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <ActiveDashboard 
            data={data} 
            isOffersOpen={isOffersOpen}
            onToggleOffers={() => setIsOffersOpen(!isOffersOpen)}
            filterOptions={filterOptions}
            selectedBakeryId={selectedBakeryId}
            onBakeryChange={setSelectedBakeryId}
            onBasketClick={(name) => setSelectedBasket(mockBasketDetails[name] || null)}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            kpiSheetType={kpiSheetType}
            onKpiSheetChange={setKpiSheetType}
          />
        )}
      </main>

      <BottomNavigation />

      {/* Basket Detail Sheet */}
      <BottomSheet isOpen={!!selectedBasket} onClose={() => setSelectedBasket(null)}>
        {selectedBasket && <BasketDetailContent basket={selectedBasket} />}
      </BottomSheet>
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
  data: DashboardData;
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
}

// Mock prospect data for KPI BottomSheets
interface DashboardProspect {
  id: string;
  name: string;
  category: CategoryType;
  stage: string;
  stageType: StageType;
  currentStep: number;
  totalSteps: number;
  context: string;
  offers: string[];
  lastSentDate: string;
  isNew: boolean;
  status: "response" | "contacted";
}

const dashboardMockProspects: DashboardProspect[] = [
  { id: "d1", name: "Restaurant Le Gourmet", category: "restauration", stage: "Réponse reçue", stageType: "response", currentStep: 3, totalSteps: 5, context: "Restaurant — Orléans, à 0.9 km", offers: ["Petit-déjeuner", "Traiteur"], lastSentDate: "05 fév. 2026", isNew: true, status: "response" },
  { id: "d2", name: "Hôtel & Spa Le Majestic", category: "hebergement", stage: "Réponse reçue", stageType: "response", currentStep: 2, totalSteps: 5, context: "Hôtel — Orléans, à 1.4 km", offers: ["Viennoiseries", "Petit-déjeuner"], lastSentDate: "02 fév. 2026", isNew: false, status: "response" },
  { id: "d3", name: "TechCorp Solutions", category: "entreprises", stage: "Réponse reçue", stageType: "response", currentStep: 4, totalSteps: 5, context: "Entreprise — Orléans, à 1.8 km", offers: ["Traiteur", "Goûter"], lastSentDate: "01 fév. 2026", isNew: false, status: "response" },
  { id: "d4", name: "Lycée Jean Moulin", category: "education", stage: "Réponse reçue", stageType: "response", currentStep: 3, totalSteps: 5, context: "Lycée — Orléans, à 1.2 km", offers: ["Pain bio"], lastSentDate: "30 jan. 2026", isNew: false, status: "response" },
  { id: "d5", name: "Bistrot du Marché", category: "restauration", stage: "Contacté", stageType: "relance", currentStep: 3, totalSteps: 5, context: "Bistrot — Orléans, à 0.8 km", offers: ["Petit-déjeuner", "Déjeuner"], lastSentDate: "28 jan. 2026", isNew: false, status: "contacted" },
  { id: "d6", name: "Coworking L'Atelier", category: "entreprises", stage: "Contacté", stageType: "relance", currentStep: 2, totalSteps: 5, context: "Coworking — Orléans, à 0.4 km", offers: ["Petit-déjeuner"], lastSentDate: "25 jan. 2026", isNew: false, status: "contacted" },
  { id: "d7", name: "Mairie d'Orléans", category: "collectivites", stage: "Contacté", stageType: "relance", currentStep: 1, totalSteps: 5, context: "Mairie — Orléans, à 0.6 km", offers: ["Événementiel"], lastSentDate: "22 jan. 2026", isNew: false, status: "contacted" },
];

const ActiveDashboard: React.FC<ActiveDashboardProps> = ({ 
  data, 
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
}) => {
  const selectedBakery = filterOptions.find(o => o.id === selectedBakeryId && o.id !== null);
  
  const responseProspects = dashboardMockProspects.filter(p => p.status === "response");
  const contactedProspects = dashboardMockProspects.filter(p => p.status === "contacted");
  
  return (
    <div className="space-y-6">
      {/* KPI Section — Filter bar + cards wrapped in a container */}
      <div className="rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] p-4 space-y-3" style={{ background: '#F8F9FB' }}>
        {/* Unified filter bar */}
        <div className="flex items-center gap-2">
          {/* Period filter */}
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

          {/* Bakery filter */}
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
              {filterOptions.filter(o => o.id !== null).map((option) => (
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
        {(() => {
          const kpis = getDashboardKpis(selectedBakeryId, selectedPeriod);
          return (
            <>
              {/* Zone 1 — White clickable KPI cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onKpiSheetChange("responses")}
                  className="flex items-center rounded-xl border border-border shadow-sm px-3 py-3 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group border-l-4 border-l-success bg-success/5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-foreground">{kpis.responses}</p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Réponses reçues</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-success rotate-[-90deg] flex-shrink-0" />
                </button>

                <button
                  onClick={() => onKpiSheetChange("contacted")}
                  className="flex items-center rounded-xl border border-border shadow-sm px-3 py-3 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group border-l-4 border-l-amber-accent bg-[hsl(var(--amber-accent)/0.05)]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-foreground">{contactedProspects.length}</p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Ont été recontactés</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-amber-accent rotate-[-90deg] flex-shrink-0" />
                </button>
              </div>

              {/* Zone 2 — Blue card with non-clickable KPIs */}
              <div className="bg-primary rounded-xl px-4 py-3 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[11px] text-primary-foreground/70 mb-0.5">Nouveaux prospects</span>
                    <span className="text-[28px] leading-tight font-bold">{kpis.prospects}</span>
                  </div>
                  <div className="w-px h-10 bg-primary-foreground/30" />
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[11px] text-primary-foreground/70 mb-0.5">Emails envoyés</span>
                    <span className="text-[28px] leading-tight font-bold">{kpis.emails}</span>
                  </div>
                  <div className="w-px h-10 bg-primary-foreground/30" />
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[11px] text-primary-foreground/70 mb-0.5">Relances</span>
                    <span className="text-[28px] leading-tight font-bold">{kpis.relances}</span>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* === Desktop: 2-column grid / Mobile: single column === */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-7 space-y-5">
          {/* Top Responding Categories */}
          {data.topCategories.length > 0 && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-4">
              <h3 className="font-medium text-foreground mb-3 text-sm">Catégories qui ont le plus répondu</h3>
              <div className="space-y-3">
                {data.topCategories.map((category) => {
                  const maxResponses = Math.max(...data.topCategories.map(c => c.responses));
                  const barWidth = maxResponses > 0 ? (category.responses / maxResponses) * 100 : 0;
                  return (
                    <div key={category.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {(() => { const CatIcon = categoryLucideMap[category.name]; return CatIcon ? <CatIcon className="h-3.5 w-3.5 text-muted-foreground" /> : null; })()}
                          <span className="text-sm text-foreground">{category.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {category.responses}
                        </span>
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
              {data.totalBakeries} boulangerie{data.totalBakeries > 1 ? 's' : ''}
            </span>
            {data.activeCampaigns > 0 ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success/10 text-success">
                {data.activeCampaigns} campagne{data.activeCampaigns > 1 ? 's' : ''} active{data.activeCampaigns > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                Aucune campagne
              </span>
            )}
          </div>

          {data.offers.length > 0 && (
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
                  {data.offers.map((offer) => (
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
        title={kpiSheetType === "responses" ? "Réponses reçues" : "Ont été recontactés"}
      >
        <div className="space-y-3">
          {(kpiSheetType === "responses" ? responseProspects : contactedProspects).map((prospect) => (
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
              onClick={() => {}}
            />
          ))}
          {(kpiSheetType === "responses" ? responseProspects : contactedProspects).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun prospect dans cette catégorie.</p>
          )}
        </div>
      </KpiPanel>
    </div>
  );
};

// KPI Card Component
interface KpiCardProps {
  value: string;
  label: string;
  icon: React.ElementType;
}

const KpiCard: React.FC<KpiCardProps> = ({ value, label, icon: Icon }) => (
  <div className="bg-card rounded-xl p-4 shadow-sm border border-border text-center">
    <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
    <p className="text-xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground leading-tight">{label}</p>
  </div>
);

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
    </div>
  );
};

export default DashboardPage;
