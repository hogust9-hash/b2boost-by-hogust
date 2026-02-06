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

  return {
    responsesReceived: totalResponses,
    emailsSent: totalEmails,
    prospectsContacted: totalProspects,
    responseRate: Math.round(avgResponseRate * 10) / 10,
    activeCampaigns,
    totalBakeries: bakeries.length,
    offers: allOffers,
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
    };
  };
  
  const data = getData();
  
  const filterOptions = [
    { id: null, label: "Toutes mes boulangeries" },
    ...mockBakeriesStats.map(b => ({ id: b.id, label: b.name })),
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header notificationCount={data.responsesReceived} />
      
      <main className="px-4 py-6 max-w-lg mx-auto">
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
  <div className="flex flex-col items-center justify-center text-center py-12">
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
}) => (
  <div className="space-y-6">
    {/* Bakery Filter */}
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
      {filterOptions.map((option) => (
        <button
          key={option.id ?? "all"}
          onClick={() => onBakeryChange(option.id)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedBakeryId === option.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>

    {/* Main KPI Block */}
    <div className="bg-primary rounded-xl p-5 text-primary-foreground relative overflow-hidden">
      <div className="relative z-10">
        <p className="text-4xl font-bold mb-1">{data.responsesReceived}</p>
        <p className="text-primary-foreground/90">réponses reçues</p>
      </div>
      <MailOpen className="absolute right-4 top-1/2 -translate-y-1/2 h-16 w-16 text-primary-foreground/20" />
    </div>

    {/* Secondary KPIs */}
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

    {/* Campaign Status */}
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

    {/* Primary CTA */}
    <Button fullWidth size="lg">
      {data.responsesReceived > 0 ? (
        <>
          <MailOpen className="h-5 w-5" />
          Voir les réponses
        </>
      ) : (
        <>
          <Rocket className="h-5 w-5" />
          Lancer ma campagne
        </>
      )}
    </Button>

    {/* My Offers Section */}
    {data.offers.length > 0 && (
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <button
          onClick={onToggleOffers}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <span className="font-medium text-foreground">Mes offres</span>
          {isOffersOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        
        {isOffersOpen && (
          <div className="px-4 pb-4 space-y-2">
            {data.offers.map((offer) => (
              <div key={offer} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm text-foreground">{offer}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);

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
