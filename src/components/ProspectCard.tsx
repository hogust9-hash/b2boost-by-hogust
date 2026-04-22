import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, UtensilsCrossed, Bed, GraduationCap, Building2, Landmark, type LucideIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { CategoryType } from "@/components/ui/badge-category";

type StageType = "initial" | "relance" | "response" | "finished";

const categoryIcon: Record<CategoryType, LucideIcon> = {
  restauration: UtensilsCrossed,
  hebergement: Bed,
  education: GraduationCap,
  entreprises: Building2,
  collectivites: Landmark,
};

interface ProspectCardProps {
  name: string;
  category?: CategoryType;
  stage: string;
  stageType: StageType;
  currentStep?: number;
  totalSteps?: number;
  context: string;
  offers: string[];
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
  // Called checkbox
  isCalled?: boolean;
  onToggleCalled?: () => void;
  // Compact mode for finished cards
  compact?: boolean;
}

// Status badge component with optional progression dots
const StatusBadge: React.FC<{
  stage: string;
  stageType: StageType;
  currentStep?: number;
  totalSteps?: number;
}> = ({ stage, stageType, currentStep = 1, totalSteps = 5 }) => {
  const badgeStyles = {
    initial: "bg-[#DBEAFE] text-[#1E40AF]",
    relance: "bg-[#4F46E5] text-white",
    response: "bg-[#10B981] text-white",
    finished: "bg-[#9CA3AF] text-white",
  };

  const showDots = stageType === "initial" || stageType === "relance";

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={cn(
          "px-2 py-1 rounded text-xs font-medium whitespace-nowrap",
          badgeStyles[stageType]
        )}
      >
        {stage}
      </span>
      {showDots && (
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                i < currentStep ? "bg-[#4F46E5]" : "bg-[#E5E7EB]"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Offer tags component
const OfferTags: React.FC<{ offers: string[] }> = ({ offers }) => {
  const maxVisible = 3;
  const visibleOffers = offers.slice(0, maxVisible - (offers.length > maxVisible ? 1 : 0));
  const remainingCount = offers.length - visibleOffers.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleOffers.map((offer, index) => (
        <span
          key={index}
          className="px-2 py-0.5 border border-[#E5E7EB] rounded text-xs text-[#374151] bg-transparent"
        >
          {offer}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="px-2 py-0.5 border border-[#E5E7EB] rounded text-xs text-[#374151] bg-transparent">
          +{remainingCount} autre{remainingCount > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
};

const ProspectCard: React.FC<ProspectCardProps> = ({
  name,
  category,
  stage,
  stageType,
  currentStep = 1,
  totalSteps = 5,
  context,
  offers,
  lastSentDate,
  isNew = false,
  onClick,
  className,
  showResponseAction = false,
  isHandled = false,
  handledDate,
  onMarkAsHandled,
  onMarkAsUnhandled,
  isCalled = false,
  onToggleCalled,
  compact = false,
}) => {
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isHandled) {
      onMarkAsUnhandled?.();
    } else {
      onMarkAsHandled?.();
    }
  };

  const handleCalledClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCalled?.();
  };

  // Compact mode: only name + category badge + date
  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "relative rounded-lg px-3 py-2 border border-border",
          "cursor-pointer transition-all duration-150",
          "hover:shadow-sm hover:border-primary/20",
          "active:scale-[0.99]",
          "bg-muted/30",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="text-xs font-medium text-foreground truncate">{name}</h3>
            {category && (() => {
              const Icon = categoryIcon[category];
              return (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border border-border text-muted-foreground bg-background whitespace-nowrap flex-shrink-0">
                  <Icon className="h-2.5 w-2.5" />
                </span>
              );
            })()}
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">{lastSentDate}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-lg p-3.5 border border-border",
        "cursor-pointer transition-all duration-150",
        "hover:shadow-sm hover:border-primary/20",
        "active:scale-[0.99]",
        isHandled ? "bg-muted/50" : "bg-card",
        className
      )}
    >
      {/* Badge NEW */}
      {isNew && !isHandled && (
        <span className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
          NEW
        </span>
      )}

      {/* Line 1: Name + Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h3 className="text-sm font-semibold text-foreground truncate flex-1">
          {name}
        </h3>
        {!showResponseAction && (
          <StatusBadge
            stage={stage}
            stageType={stageType}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        )}
      </div>

      {/* Offer badge (violet) just below name */}
      {offers.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {offers.map((offer, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]"
            >
              {offer}
            </span>
          ))}
        </div>
      )}

      {/* Line 2: Context with icon */}
      <p className="text-xs text-muted-foreground mb-1.5 inline-flex items-center gap-1">
        {category && (() => { const Icon = categoryIcon[category]; return <Icon className="h-3 w-3" />; })()}
        {context}
      </p>

      {/* Line 4: Date */}
      <p className="text-xs text-muted-foreground">
        {stageType === "response" ? "Réponse client" : "Dernier envoi"} : {lastSentDate}
      </p>

      {/* Response Action Section */}
      {showResponseAction && (
        <div className="mt-4">
          {isHandled ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded-lg">
                <Check className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  Pris en charge — {handledDate}
                </span>
              </div>
              <button
                onClick={handleActionClick}
                className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
              >
                Marquer comme à répondre
              </button>
            </div>
          ) : (
            <button
              onClick={handleActionClick}
              className="w-full h-9 flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 bg-muted border border-border text-foreground hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:shadow-sm"
            >
              <Checkbox className="h-4 w-4 pointer-events-none" />
              <span className="text-sm">C'est fait, j'ai répondu</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export { ProspectCard };
export type { ProspectCardProps, StageType };
