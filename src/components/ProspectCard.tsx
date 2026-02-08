import * as React from "react";
import { cn } from "@/lib/utils";
import { BadgeCategory, CategoryType } from "./ui/badge-category";
import { BadgeStage } from "./ui/badge-stage";
import { BadgeOffer } from "./ui/badge-offer";
import { BadgeNew } from "./ui/badge-new";
import { Check } from "lucide-react";

interface ProspectCardProps {
  name: string;
  category: CategoryType;
  categoryLabel?: string;
  stage: string;
  offer: string;
  lastSentDate: string;
  isNew?: boolean;
  onClick?: () => void;
  className?: string;
  // Response handling props
  showResponseAction?: boolean;
  isHandled?: boolean;
  handledDate?: string;
  onMarkAsHandled?: () => void;
  onMarkAsUnhandled?: () => void;
}

const ProspectCard: React.FC<ProspectCardProps> = ({
  name,
  category,
  categoryLabel,
  stage,
  offer,
  lastSentDate,
  isNew = false,
  onClick,
  className,
  showResponseAction = false,
  isHandled = false,
  handledDate,
  onMarkAsHandled,
  onMarkAsUnhandled,
}) => {
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isHandled) {
      onMarkAsUnhandled?.();
    } else {
      onMarkAsHandled?.();
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-xl shadow-sm p-4 border border-border",
        "cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        "active:scale-[0.99]",
        "md:hover:scale-[1.01]",
        isHandled ? "bg-muted/50" : "bg-card",
        className
      )}
    >
      {/* Badge Nouveau */}
      {isNew && !isHandled && <BadgeNew />}

      {/* Header: Nom entreprise */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-foreground pr-4 truncate">
          {name}
        </h3>
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <BadgeCategory category={category} label={categoryLabel} />
        <BadgeStage label={stage} />
        <BadgeOffer label={offer} />
      </div>

      {/* Footer: Date dernier envoi */}
      <div className="text-sm text-muted-foreground">
        Dernier envoi : <span className="font-medium">{lastSentDate}</span>
      </div>

      {/* Response Action Section */}
      {showResponseAction && (
        <div className="mt-4">
          {isHandled ? (
            <div className="space-y-2">
              {/* Handled Badge */}
              <div className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded-lg">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  Pris en charge — {handledDate}
                </span>
              </div>
              {/* Unmark Link */}
              <button
                onClick={handleActionClick}
                className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
              >
                Marquer comme non traité
              </button>
            </div>
          ) : (
            <button
              onClick={handleActionClick}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-white font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#10B981" }}
            >
              <span>✅</span>
              <span>C'est fait, j'ai répondu</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export { ProspectCard };
export type { ProspectCardProps };
