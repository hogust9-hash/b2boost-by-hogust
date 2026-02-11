import * as React from "react";
import { cn } from "@/lib/utils";

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
  emoji: string; 
  defaultLabel: string;
}> = {
  restauration: { emoji: "🍽", defaultLabel: "Restauration" },
  hebergement: { emoji: "🏨", defaultLabel: "Hébergement" },
  education: { emoji: "🏫", defaultLabel: "Éducation" },
  entreprises: { emoji: "🏢", defaultLabel: "Entreprises" },
  collectivites: { emoji: "🏛", defaultLabel: "Collectivités" },
};

const BadgeCategory = React.forwardRef<HTMLSpanElement, BadgeCategoryProps>(
  ({ category, label, className }, ref) => {
    const config = categoryConfig[category];
    const displayLabel = label || config.defaultLabel;

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-border bg-background text-foreground",
          className
        )}
      >
        <span>{config.emoji}</span>
        <span>{displayLabel}</span>
      </span>
    );
  }
);
BadgeCategory.displayName = "BadgeCategory";

export { BadgeCategory };
