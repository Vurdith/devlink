"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const navItems = [
  { 
    href: "/settings", 
    label: "Profile", 
    description: "Account type & preferences",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    color: "from-purple-500 to-purple-600"
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
    color: "from-purple-400 to-purple-500"
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
    color: "from-purple-500 to-purple-700"
  }
];

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map((item, index) => {
        // For the main settings page, only exact match
        // For sub-pages, check if pathname starts with the href
        const isActive = item.href === "/settings" 
          ? pathname === "/settings"
          : pathname === item.href || pathname.startsWith(item.href + "/");
        
        return (
          <div
            key={item.href}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Link
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-purple-500/15" 
                  : "hover:bg-purple-500/10"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-r-full" />
              )}
              
              {/* Icon */}
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                isActive 
                  ? `bg-gradient-to-br ${item.color} text-white shadow-lg shadow-purple-500/25` 
                  : "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300"
              )}>
                {item.icon}
              </div>
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium transition-colors",
                  isActive ? "text-white" : "text-[var(--muted-foreground)] group-hover:text-white"
                )}>
                  {item.label}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] truncate">
                  {item.description}
                </div>
              </div>
              
              {/* Arrow */}
              <svg 
                className={cn(
                  "w-4 h-4 transition-all duration-200",
                  isActive 
                    ? "text-purple-400 opacity-100" 
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
