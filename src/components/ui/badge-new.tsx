import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeNewProps {
  className?: string;
}

const BadgeNew = React.forwardRef<HTMLSpanElement, BadgeNewProps>(
  ({ className }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive",
          "animate-pulse",
          className
        )}
        aria-label="Nouveau"
      />
    );
  }
);
BadgeNew.displayName = "BadgeNew";

export { BadgeNew };
