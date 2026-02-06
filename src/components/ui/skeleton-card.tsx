import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn("animate-pulse bg-muted rounded", className)} />
);

// Skeleton for ProspectCard
const ProspectCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "bg-card rounded-xl shadow-sm p-4 border border-border",
      className
    )}
  >
    {/* Title skeleton */}
    <Skeleton className="h-5 w-3/4 mb-3" />
    
    {/* Badges row skeleton */}
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="h-7 w-24 rounded-full" />
      <Skeleton className="h-7 w-20 rounded-full" />
      <Skeleton className="h-7 w-28 rounded-full" />
    </div>
    
    {/* Date skeleton */}
    <Skeleton className="h-4 w-40" />
  </div>
);

// Skeleton for KPI cards
const KpiCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "bg-card rounded-xl p-4 shadow-sm border border-border text-center",
      className
    )}
  >
    <Skeleton className="h-5 w-5 mx-auto mb-2 rounded" />
    <Skeleton className="h-6 w-12 mx-auto mb-1" />
    <Skeleton className="h-3 w-16 mx-auto" />
  </div>
);

// Skeleton for section headers
const SectionHeaderSkeleton: React.FC = () => (
  <div className="flex items-center justify-between px-4 py-3 bg-muted">
    <div className="flex items-center gap-3">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-8 rounded-full" />
    </div>
    <Skeleton className="h-5 w-5" />
  </div>
);

export { Skeleton, ProspectCardSkeleton, KpiCardSkeleton, SectionHeaderSkeleton };
