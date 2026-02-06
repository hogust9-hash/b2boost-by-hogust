import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  message?: string;
  className?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = "Chargement...",
  className 
}) => (
  <div className={cn(
    "min-h-screen bg-background flex flex-col items-center justify-center p-4",
    className
  )}>
    <div className="text-center">
      {/* Logo */}
      <h1 className="text-2xl font-bold text-primary mb-6">B2Boost</h1>
      
      {/* Spinner */}
      <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
      
      {/* Message */}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Inline loading spinner (for buttons and inline content)
interface InlineLoadingProps {
  text?: string;
  className?: string;
}

const InlineLoading: React.FC<InlineLoadingProps> = ({ 
  text = "Chargement...",
  className 
}) => (
  <div className={cn("inline-flex items-center gap-2", className)}>
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>{text}</span>
  </div>
);

export { PageLoading, InlineLoading };
