"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BackButton } from "@/components/ui/BackButton";
import { memo } from "react";
import { ThemeLogoImg } from "@/components/ui/ThemeLogo";
import { navigation, userNavigation, type NavItem } from "@/config/navigation";

interface SidebarProps {
  session?: { user?: { id?: string; username?: string; name?: string; image?: string } } | null;
}

// Memoized nav link for better performance
const NavLink = memo(function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      prefetch={true}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.description}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150",
        isActive
          ? "bg-white/[0.075] text-white border border-white/10"
          : "text-[var(--muted-foreground)] hover:text-white hover:bg-white/[0.045] border border-transparent"
      )}
      title={item.description}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-[var(--color-accent-2)] rounded-r-full" />
      )}

      {/* Icon */}
      <div className={cn(
        "p-2 rounded-md transition-colors duration-150",
        isActive
          ? "bg-[rgba(var(--color-accent-2-rgb),0.10)] text-[var(--color-accent-2)]"
          : "text-[var(--muted-foreground)] group-hover:text-[var(--color-accent-2)] group-hover:bg-white/[0.04]"
      )}>
        {item.icon}
      </div>

      {/* Text */}
      <span className="font-medium">{item.name}</span>

      {/* Arrow */}
      <svg
        className={cn(
          "ml-auto w-4 h-4 transition-opacity duration-150",
          isActive ? "text-[var(--color-accent-2)] opacity-100" : "opacity-0 group-hover:opacity-50"
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
});

export const Sidebar = memo(function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const isAuthenticated = !!session;

  return (
    <aside
      role="navigation"
      aria-label="Main sidebar navigation"
      className="hidden md:flex fixed left-0 top-0 h-full w-72 z-50 flex-col border-0 border-r border-white/10 bg-[rgba(7,9,13,0.86)] shadow-[18px_0_60px_rgba(0,0,0,0.22)]"
    >
      <div className="relative flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/8">
          <Link href="/" className="flex items-center gap-3 group" prefetch={true}>
            <ThemeLogoImg className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-white font-[var(--font-space-grotesk)] tracking-tight">
                DevLink
              </h1>
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">
                Roblox Network
              </p>
            </div>
          </Link>
        </div>

        {/* Back Button */}
        <div className="px-4 pt-4">
          <BackButton className="w-full justify-start bg-white/[0.035] hover:bg-white/[0.065] rounded-lg text-[var(--muted-foreground)] hover:text-white border border-white/8" />
        </div>

        {/* Main Navigation */}
        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {/* Primary nav */}
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>

          {/* User section (only show if authenticated) */}
          {isAuthenticated && (
            <>
              <div className="py-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-rgb),0.2)] to-transparent" />
                  <span className="text-[10px] text-[rgba(var(--color-accent-rgb),0.6)] uppercase tracking-widest">Account</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-rgb),0.2)] to-transparent" />
                </div>
              </div>

              <div className="space-y-1">
                {userNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    item={item}
                    isActive={
                      pathname === item.href ||
                      (item.href === "/me" && pathname.startsWith("/u/")) ||
                      (item.href === "/settings" && pathname.startsWith("/settings"))
                    }
                  />
                ))}
              </div>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
});
