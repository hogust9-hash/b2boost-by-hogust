import React from "react";
import { Button } from "@/components/ui/button";
import { PartyPopper, ArrowRight } from "lucide-react";

const StepSuccess: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 space-y-6">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <PartyPopper className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Félicitations 🎉</h2>
        <p className="text-muted-foreground max-w-sm">
          Ta campagne est créée ! On a bien reçu ta demande. D'ici 48h, nous te contacterons pour valider son lancement.
        </p>
      </div>

      <Button onClick={() => window.location.href = "/dashboard"} size="lg" className="mt-4 gap-2">
        Accéder à mon tableau de bord
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default StepSuccess;
