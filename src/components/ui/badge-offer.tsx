import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeOfferProps {
  label: string;
  className?: string;
}

const BadgeOffer = React.forwardRef<HTMLSpanElement, BadgeOfferProps>(
  ({ label, className }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
          "bg-transparent border border-border text-muted-foreground",
          "transition-all duration-200",
          className
        )}
      >
        {label}
      </span>
    );
  }
);
BadgeOffer.displayName = "BadgeOffer";

export { BadgeOffer };
