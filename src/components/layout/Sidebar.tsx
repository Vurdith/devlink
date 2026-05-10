"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { memo } from "react";
import { ThemeLogoImg } from "@/components/ui/ThemeLogo";
import { navigation, userNavigation } from "@/config/navigation";
import { NavLinkItem } from "@/components/layout/NavLinkItem";
import { isNavItemActive } from "@/components/layout/nav-state";

interface SidebarProps {
  session?: { user?: { id?: string; username?: string; name?: string; image?: string } } | null;
}

export const Sidebar = memo(function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const isAuthenticated = !!session;

  return (
    <aside
      role="navigation"
      aria-label="Main sidebar navigation"
      className="fixed left-0 top-0 z-50 hidden h-full w-72 flex-col border-0 border-r border-white/[0.08] bg-[rgba(7,9,13,0.88)] md:flex"
    >
      <div className="relative flex flex-col h-full">
        {/* Logo Section */}
        <div className="border-b border-white/[0.08] p-6">
          <Link href="/" className="flex items-center gap-3 group" prefetch={false}>
            <ThemeLogoImg className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-white font-[var(--font-space-grotesk)] tracking-tight">
                DevLink
              </h1>
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">
                Creator network
              </p>
            </div>
          </Link>
        </div>

        {/* Back Button */}
        <div className="px-4 pt-4">
          <BackButton className="min-h-11 w-full justify-start rounded-lg border border-white/[0.08] bg-white/[0.035] text-[var(--muted-foreground)] hover:bg-white/[0.065] hover:text-white" />
        </div>

        {/* Main Navigation */}
        <nav aria-label="Primary" className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {/* Primary nav */}
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLinkItem
                key={item.name}
                item={item}
                isActive={isNavItemActive(pathname, item)}
              />
            ))}
          </div>

          {/* User section (only show if authenticated) */}
          {isAuthenticated && (
            <>
              <div className="py-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-rgb),0.2)] to-transparent" />
                  <span className="text-[10px] text-[rgba(var(--color-accent-rgb),0.6)] uppercase tracking-widest">Your space</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-rgb),0.2)] to-transparent" />
                </div>
              </div>

              <div className="space-y-1">
                {userNavigation.map((item) => (
                  <NavLinkItem
                    key={item.name}
                    item={item}
                    isActive={isNavItemActive(pathname, item)}
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
