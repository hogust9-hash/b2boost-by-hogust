import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface KpiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const KpiPanel: React.FC<KpiPanelProps> = ({ isOpen, onClose, title, children }) => {
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/30 animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom on mobile, right on desktop */}
      <div
        className={cn(
          "absolute bg-card shadow-xl flex flex-col",
          isMobile
            ? "bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh] animate-in slide-in-from-bottom duration-300"
            : "top-0 right-0 h-full w-full max-w-md border-l border-border animate-in slide-in-from-right duration-300"
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export { KpiPanel };
