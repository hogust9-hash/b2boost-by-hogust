import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeStageProps {
  label: string;
  className?: string;
}

const BadgeStage = React.forwardRef<HTMLSpanElement, BadgeStageProps>(
  ({ label, className }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
          "bg-muted text-muted-foreground",
          "transition-all duration-200",
          className
        )}
      >
        {label}
      </span>
    );
  }
);
BadgeStage.displayName = "BadgeStage";

export { BadgeStage };
