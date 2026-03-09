import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep, totalSteps, onBack }) => {
  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {onBack && currentStep > 1 && (
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors p-0.5 -ml-1">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <span className="text-xs text-muted-foreground">Étape {currentStep} sur {totalSteps}</span>
        </div>
        <span className="text-xs font-medium text-primary">{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < currentStep ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgress;
