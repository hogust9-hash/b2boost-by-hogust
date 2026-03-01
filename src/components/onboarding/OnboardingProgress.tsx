import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Étape {currentStep} sur {totalSteps}</span>
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
