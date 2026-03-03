import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Utensils, BedDouble, GraduationCap, Building2, Landmark, Briefcase } from "lucide-react";

interface BakeryEntry {
  radiusKm: number;
}

interface StepProspectsProps {
  bakeries: BakeryEntry[];
  onNext: () => void;
}

const CATEGORIES = [
  { name: "Restauration", icon: Utensils, ratio: 0.35 },
  { name: "Entreprises", icon: Building2, ratio: 0.25 },
  { name: "Professions libérales", icon: Briefcase, ratio: 0.15 },
  { name: "Hébergement", icon: BedDouble, ratio: 0.10 },
  { name: "Éducation", icon: GraduationCap, ratio: 0.08 },
  { name: "Collectivités", icon: Landmark, ratio: 0.07 },
];

const estimateTotal = (bakeries: BakeryEntry[]) =>
  bakeries.reduce((sum, b) => sum + Math.round(b.radiusKm * b.radiusKm * 0.8 + b.radiusKm * 5), 0);

const StepProspects: React.FC<StepProspectsProps> = ({ bakeries, onNext }) => {
  const total = estimateTotal(bakeries);

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Aperçu des prospects</h2>
        <p className="text-sm text-muted-foreground">Voici une estimation des cibles B2B détectées dans tes zones de couverture.</p>
      </div>

      {/* Total counter */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl px-6 py-8 text-center">
        <p className="text-4xl font-bold text-primary">{total}</p>
        <p className="text-sm text-muted-foreground mt-1">prospects B2B détectés</p>
      </div>

      {/* Category breakdown */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {CATEGORIES.map((cat) => {
          const count = Math.round(total * cat.ratio);
          const Icon = cat.icon;
          return (
            <div key={cat.name} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{cat.name}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <Progress value={cat.ratio * 100} className="h-1.5" />
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={onNext} fullWidth size="lg">
        Continuer
      </Button>
    </div>
  );
};

export default StepProspects;
