import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: string | LucideIcon;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  ctaLabel,
  onCtaClick,
  className,
  children,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === "string") {
      // Emoji
      return <span className="text-5xl mb-4">{icon}</span>;
    }
    
    // Lucide icon
    const IconComponent = icon;
    return (
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-12 px-6",
      className
    )}>
      {renderIcon()}
      
      <h2 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h2>
      
      {subtitle && (
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          {subtitle}
        </p>
      )}
      
      {ctaLabel && onCtaClick && (
        <Button onClick={onCtaClick} size="lg">
          {ctaLabel}
        </Button>
      )}
      
      {children}
    </div>
  );
};

export { EmptyState };
