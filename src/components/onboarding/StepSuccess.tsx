import React from "react";
import { PartyPopper } from "lucide-react";
import dashboardPreview1 from "@/assets/dashboard-preview-1.png";
import dashboardPreview2 from "@/assets/dashboard-preview-2.png";

const StepSuccess: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center px-4 py-10 space-y-8">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <PartyPopper className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-3 max-w-sm">
        <h2 className="text-2xl font-bold text-foreground">Félicitations 🎉</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Ta demande est bien enregistrée. On récolte les informations sur les prospects identifiés.
        </p>
        <p className="text-sm font-semibold text-primary">
          Tu auras bientôt accès à ton dashboard.
        </p>
      </div>

      <div className="w-full space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Aperçu de ton futur dashboard
        </p>
        <div className="space-y-3">
          <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            <img
              src={dashboardPreview1}
              alt="Aperçu du tableau de bord"
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            <img
              src={dashboardPreview2}
              alt="Aperçu de la page prospects"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepSuccess;
