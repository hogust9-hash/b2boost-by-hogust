import * as React from "react";
import { Bell } from "lucide-react";

interface HeaderProps {
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  notificationCount = 0,
  onNotificationClick,
}) => {
  return (
    <header className="sticky top-0 bg-card border-b border-border h-14 z-50">
      <div className="flex items-center justify-between h-full px-4 max-w-5xl mx-auto">
        {/* Logo */}
        <div className="flex items-baseline gap-0">
          <span className="text-lg font-bold text-primary">B2Boost</span>
          <span className="text-xs text-muted-foreground font-normal ml-1.5">by Hogust</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

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
