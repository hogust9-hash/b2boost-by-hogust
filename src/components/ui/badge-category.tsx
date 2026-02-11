import * as React from "react";
import { cn } from "@/lib/utils";
import { UtensilsCrossed, Bed, GraduationCap, Building2, Landmark, type LucideIcon } from "lucide-react";

export type CategoryType = 
  | "restauration" 
  | "hebergement" 
  | "education" 
  | "entreprises" 
  | "collectivites";

interface BadgeCategoryProps {
  category: CategoryType;
  label?: string;
  className?: string;
}

const categoryConfig: Record<CategoryType, { 
  icon: LucideIcon; 
  defaultLabel: string;
}> = {
  restauration: { icon: UtensilsCrossed, defaultLabel: "Restauration" },
  hebergement: { icon: Bed, defaultLabel: "Hébergement" },
  education: { icon: GraduationCap, defaultLabel: "Éducation" },
  entreprises: { icon: Building2, defaultLabel: "Entreprises" },
  collectivites: { icon: Landmark, defaultLabel: "Collectivités" },
};

const BadgeCategory = React.forwardRef<HTMLSpanElement, BadgeCategoryProps>(
  ({ category, label, className }, ref) => {
    const config = categoryConfig[category];
    const Icon = config.icon;
    const displayLabel = label || config.defaultLabel;

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-background text-muted-foreground",
          className
        )}
      >
        <Icon className="h-3 w-3" />
        <span>{displayLabel}</span>
      </span>
    );
  }
);
BadgeCategory.displayName = "BadgeCategory";

export { BadgeCategory };
