import * as React from "react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { 
  MailOpen, 
  Send, 
  Users, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Check,
  Rocket,
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const DashboardPage = () => {
  const [isOffersOpen, setIsOffersOpen] = useState(true);
  const [selectedBakeryId, setSelectedBakeryId] = useState<string | null>(null);
  // Toggle this to see empty state: true = empty, false = with data
  const [isEmpty] = useState(false);
  
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
          />
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center text-center py-12 md:py-24">
    <div className="text-6xl mb-6">📬</div>
    <h2 className="text-xl font-semibold text-foreground mb-2">
      Prêt à développer votre clientèle pro ?
    </h2>
    <p className="text-muted-foreground mb-8 max-w-xs">
      Lancez votre première campagne de prospection en quelques clics.
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
}

const ActiveDashboard: React.FC<ActiveDashboardProps> = ({ 
  data, 
  isOffersOpen, 
  onToggleOffers,
  filterOptions,
  selectedBakeryId,
  onBakeryChange,
}) => {
  const selectedBakery = filterOptions.find(o => o.id === selectedBakeryId && o.id !== null);
  
  return (
    <div className="space-y-6">
      {/* Bakery Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => onBakeryChange(null)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedBakeryId === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Toutes mes boulangeries
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors outline-none",
              selectedBakeryId !== null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <span className="truncate max-w-[160px]">
              {selectedBakery ? selectedBakery.label : "Sélectionner une boulangerie"}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-56 bg-card border border-border shadow-md z-50"
          >
            {filterOptions.filter(o => o.id !== null).map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => onBakeryChange(option.id)}
                className={cn(
                  "cursor-pointer",
                  selectedBakeryId === option.id && "bg-primary/10 text-primary"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* === Desktop: 2-column grid / Mobile: single column === */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

        {/* Left column (main KPIs) — spans 7 cols on desktop */}
        <div className="md:col-span-7 space-y-5">
          {/* Main KPI Block */}
          <div className="bg-primary rounded-xl p-5 md:p-6 text-primary-foreground relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-4xl md:text-5xl font-bold mb-1">{data.responsesReceived}</p>
              <p className="text-primary-foreground/90 md:text-lg">réponses reçues</p>
            </div>
            <MailOpen className="absolute right-4 top-1/2 -translate-y-1/2 h-16 w-16 md:h-20 md:w-20 text-primary-foreground/20" />
          </div>

          {/* Secondary KPIs — 3 cards in a row */}
          <div className="grid grid-cols-3 gap-3">
            <KpiCard 
              value={data.emailsSent.toString()} 
              label="emails envoyés" 
              icon={Send} 
            />
            <KpiCard 
              value={data.prospectsContacted.toString()} 
              label="prospects contactés" 
              icon={Users} 
            />
            <KpiCard 
              value={`${data.responseRate}%`} 
              label="taux de réponse" 
              icon={TrendingUp} 
            />
          </div>

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
        </div>

        {/* Right column (details) — spans 5 cols on desktop */}
        <div className="md:col-span-5 space-y-5">
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
                          <span 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm text-foreground">{category.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {category.responses}
                        </span>
                      </div>
                      {/* Progress bar for visual weight */}
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden ml-[18px]">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%`, backgroundColor: category.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Baskets Section */}
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
                <div className="px-4 pb-4 space-y-2">
                  {data.offers.map((offer) => (
                    <button
                      key={offer}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all group active:scale-[0.98]"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <Check className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium text-foreground flex-1">{offer}</span>
                      <ChevronDown className="h-4 w-4 text-primary/60 -rotate-90 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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

export default DashboardPage;
