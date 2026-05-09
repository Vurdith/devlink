"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { iconBox, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

const navItems = [
  { 
    href: "/settings", 
    label: "Account", 
    description: "Connected accounts & linking",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    useAccent: true
  },
  { 
    href: "/settings/appearance", 
    label: "Appearance", 
    description: "Theme & color settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    useAccent: true
  },
  { 
    href: "/settings/security", 
    label: "Security", 
    description: "Password & authentication",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    useAccent: true
  },
  { 
    href: "/settings/notifications", 
    label: "Notifications", 
    description: "Email & push alerts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    useAccent: true
  },
  { 
    href: "/settings/messaging", 
    label: "Messaging", 
    description: "Message requests & privacy",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    useAccent: true
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
                "group relative flex min-w-[132px] items-center gap-2 rounded-lg border px-3 py-2.5 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)] sm:min-w-[150px] md:min-w-0 md:gap-3 md:py-3",
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
                "h-8 w-8 shrink-0 transition-all duration-200 md:h-9 md:w-9",
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
              <svg 
                className={cn(
                  "hidden h-4 w-4 transition-all duration-200 md:block",
                  isActive 
                    ? "text-[var(--color-accent)] opacity-100" 
                    : "text-[var(--muted-foreground)] opacity-0 group-hover:opacity-50 -translate-x-1 group-hover:translate-x-0"
                )}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
