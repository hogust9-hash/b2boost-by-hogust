import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";

interface StepWelcomeProps {
  onNext: () => void;
}

const StepWelcome: React.FC<StepWelcomeProps> = ({ onNext }) => {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || "Artisan";

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 space-y-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Bienvenue, {name} !</h2>
        <p className="text-muted-foreground max-w-sm">Configurons ensemble votre campagne de prospection B2B.

        </p>
      </div>

      <Button onClick={onNext} size="lg" className="mt-4">
        Commencer
      </Button>
    </div>);

};

export default StepWelcome;