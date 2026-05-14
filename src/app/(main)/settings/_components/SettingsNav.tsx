"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Lock, MessageSquare, Palette, UserRound } from "lucide-react";
import { iconBox, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

const navItems = [
  { 
    href: "/settings", 
    label: "Account", 
    description: "Sign-in methods",
    icon: <UserRound className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
  { 
    href: "/settings/appearance", 
    label: "Appearance", 
    description: "Theme and logo",
    icon: <Palette className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
  { 
    href: "/settings/security", 
    label: "Security", 
    description: "Password and 2FA",
    icon: <Lock className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
  { 
    href: "/settings/notifications", 
    label: "Notifications", 
    description: "Email delivery",
    icon: <Bell className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
  { 
    href: "/settings/messaging", 
    label: "Messaging", 
    description: "Inbox access",
    icon: <MessageSquare className="h-[18px] w-[18px]" aria-hidden="true" />,
  }
];

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex min-w-0 max-w-full gap-2 overflow-x-auto pb-0.5 md:block md:space-y-2 md:overflow-visible md:pb-0"
      style={{
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      aria-label="Settings sections"
    >
      {navItems.map((item, index) => {
        // For the main settings page, only exact match
        // For sub-pages, check if pathname starts with the href
        const isActive = item.href === "/settings" 
          ? pathname === "/settings"
          : pathname === item.href || pathname.startsWith(item.href + "/");
        
        return (
          <div
            key={item.href}
            className="min-w-0 shrink-0 animate-fade-in md:shrink"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Link
              href={item.href}
              className={cn(
                "group relative flex min-w-[132px] items-center gap-2 rounded-lg border px-3 py-2.5 outline-none transition-all duration-200 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)] sm:min-w-[150px] md:min-w-0 md:gap-3 md:py-3",
                isActive 
                  ? ui.active.cyan
                  : ui.control.ghost
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute inset-x-3 bottom-0 h-px rounded-full bg-[var(--color-accent-2)] md:inset-x-auto md:left-0 md:top-1/2 md:h-8 md:w-0.5 md:-translate-y-1/2 md:rounded-r-full" />
              )}
              
              {/* Icon */}
              <div className={cn(
                  "h-8 w-8 shrink-0 transition-all duration-200 group-hover:scale-[1.03] md:h-9 md:w-9",
                isActive 
                  ? iconBox("cyan")
                  : iconBox("muted", "group-hover:bg-white/[0.07] group-hover:text-white")
              )}>
                {item.icon}
              </div>
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "truncate text-sm font-medium transition-colors",
                  isActive ? "text-white" : "text-[var(--muted-foreground)] group-hover:text-white"
                )}>
                  {item.label}
                </div>
                <div className="hidden truncate text-xs text-[var(--muted-foreground)] sm:block">
                  {item.description}
                </div>
              </div>
              
              {/* Arrow */}
              <ChevronRight
                className={cn(
                  "hidden h-4 w-4 transition-all duration-200 md:block",
                  isActive 
                    ? "text-[var(--color-accent)] opacity-100" 
                    : "text-[var(--muted-foreground)] opacity-0 group-hover:opacity-50 -translate-x-1 group-hover:translate-x-0"
                )}
                aria-hidden="true"
              />
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
