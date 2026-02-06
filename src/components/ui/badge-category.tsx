import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  UtensilsCrossed, 
  Bed, 
  GraduationCap, 
  Building2, 
  Landmark 
} from "lucide-react";

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
  icon: React.ElementType; 
  defaultLabel: string;
  colorClass: string;
}> = {
  restauration: {
    icon: UtensilsCrossed,
    defaultLabel: "Restauration",
    colorClass: "badge-restauration",
  },
  hebergement: {
    icon: Bed,
    defaultLabel: "Hébergement",
    colorClass: "badge-hebergement",
  },
  education: {
    icon: GraduationCap,
    defaultLabel: "Éducation",
    colorClass: "badge-education",
  },
  entreprises: {
    icon: Building2,
    defaultLabel: "Entreprises",
    colorClass: "badge-entreprises",
  },
  collectivites: {
    icon: Landmark,
    defaultLabel: "Collectivités",
    colorClass: "badge-collectivites",
  },
};

const BadgeCategory = React.forwardRef<HTMLSpanElement, BadgeCategoryProps>(
  ({ category, label, className }, ref) => {
    const config = categoryConfig[category];
    const Icon = config.icon;
    const displayLabel = label || config.defaultLabel;

    return (
      <span
        ref={ref}
        className={cn(config.colorClass, "gap-1.5", className)}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{displayLabel}</span>
      </span>
    );
  }
);
BadgeCategory.displayName = "BadgeCategory";

export { BadgeCategory };
