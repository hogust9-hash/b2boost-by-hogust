import * as React from "react";
import { cn } from "@/lib/utils";
import { BadgeCategory, CategoryType } from "./ui/badge-category";
import { BadgeStage } from "./ui/badge-stage";
import { BadgeOffer } from "./ui/badge-offer";
import { BadgeNew } from "./ui/badge-new";

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
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative bg-card rounded-xl shadow-sm p-4 border border-border",
        "cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        "active:scale-[0.99]",
        className
      )}
    >
      {/* Badge Nouveau */}
      {isNew && <BadgeNew />}

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
    </div>
  );
};

export { ProspectCard };
export type { ProspectCardProps };
