import * as React from "react";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown } from "lucide-react";
import { BadgeNew } from "./ui/badge-new";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Bakery {
  id: string;
  name: string;
}

interface HeaderProps {
  bakeries?: Bakery[];
  selectedBakery?: Bakery;
  onBakeryChange?: (bakery: Bakery) => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const defaultBakeries: Bakery[] = [
  { id: "1", name: "Boulangerie du Centre" },
  { id: "2", name: "Au Pain Doré" },
  { id: "3", name: "La Mie Câline" },
];

const Header: React.FC<HeaderProps> = ({
  bakeries = defaultBakeries,
  selectedBakery,
  onBakeryChange,
  notificationCount = 0,
  onNotificationClick,
}) => {
  const [selected, setSelected] = React.useState<Bakery>(
    selectedBakery || bakeries[0]
  );

  const handleBakerySelect = (bakery: Bakery) => {
    setSelected(bakery);
    onBakeryChange?.(bakery);
  };

  return (
    <header className="sticky top-0 bg-card border-b border-border h-14 z-50">
      <div className="flex items-center justify-between h-full px-4 max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex-shrink-0">
          <span className="text-lg font-bold text-primary">B2Boost</span>
        </div>

        {/* Bakery Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 outline-none">
            <span className="max-w-[140px] truncate">{selected.name}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="center" 
            className="w-56 bg-card border border-border shadow-md z-50"
          >
            {bakeries.map((bakery) => (
              <DropdownMenuItem
                key={bakery.id}
                onClick={() => handleBakerySelect(bakery)}
                className={cn(
                  "cursor-pointer",
                  selected.id === bakery.id && "bg-primary/10 text-primary"
                )}
              >
                {bakery.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification Bell */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} nouvelles)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium px-1">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export { Header };
