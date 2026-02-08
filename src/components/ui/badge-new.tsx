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
          "absolute -top-2 -right-2 px-2 py-1 rounded-full bg-destructive text-destructive-foreground",
          "text-xs font-semibold",
          className
        )}
        aria-label="Nouveau"
      >
        NEW
      </span>
    );
  }
);
BadgeNew.displayName = "BadgeNew";

export { BadgeNew };
