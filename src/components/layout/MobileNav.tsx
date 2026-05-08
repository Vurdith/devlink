"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BackButton } from "@/components/ui/BackButton";
import { ThemeLogoImg } from "@/components/ui/ThemeLogo";
import { navigation, userNavigation, type NavItem } from "@/config/navigation";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";

interface MobileNavProps {
  session?: { user?: { id?: string; username?: string; name?: string; image?: string } } | null;
}

// Memoized nav link component matching desktop Sidebar exactly
const NavLink = memo(function NavLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
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
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
});

export const MobileNav = memo(function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = !!session;

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useBodyScrollLock(isOpen);

  return (
    <>
      {/* Hamburger Button - Fixed in top left, vertically centered in navbar (h-16 = 64px, button ~44px) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-[10px] left-4 z-50 p-2.5 rounded-lg bg-[rgba(7,9,13,0.9)] border border-white/10 hover:border-[rgba(var(--color-accent-2-rgb),0.35)] transition-all duration-150 active:scale-95 shadow-[0_10px_28px_rgba(0,0,0,0.32)]"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
          aria-hidden="true"
        >
          {isOpen ? (
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M3 12h18M3 6h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/82 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu - Exact same styling as desktop Sidebar */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-out bg-[rgba(7,9,13,0.94)] border-0 border-r border-white/10 shadow-[18px_0_60px_rgba(0,0,0,0.34)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative flex flex-col h-full">
          {/* Logo Section - matching Sidebar */}
          <div className="p-6 border-b border-white/5">
            <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
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

          {/* Back Button - matching Sidebar */}
          <div className="px-4 pt-4">
            <BackButton
              className="w-full justify-start bg-white/[0.035] hover:bg-white/[0.065] rounded-lg text-[var(--muted-foreground)] hover:text-white border border-white/8"
              onClick={() => setIsOpen(false)}
            />
          </div>

          {/* Main Navigation - matching Sidebar */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {/* Primary nav */}
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  item={item}
                  isActive={pathname === item.href}
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </div>

            {/* User section (only show if authenticated) - matching Sidebar */}
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
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Auth buttons for non-authenticated users */}
            {!isAuthenticated && (
              <>
                <div className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-rgb),0.2)] to-transparent" />
                    <span className="text-[10px] text-[rgba(var(--color-accent-rgb),0.6)] uppercase tracking-widest">Account</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-rgb),0.2)] to-transparent" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white font-medium hover:from-[var(--color-accent-hover)] hover:to-[var(--color-accent-hover)] transition-all shadow-lg shadow-[rgba(var(--color-accent-rgb),0.2)]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="8.5" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="20" y1="8" x2="20" y2="14" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="23" y1="11" x2="17" y2="11" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </nav>

        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[rgba(7,9,13,0.92)] border-0 border-t border-white/10 safe-area-bottom shadow-[0_-16px_48px_rgba(0,0,0,0.28)]">
        <div className="flex justify-around items-center h-16 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150",
                  isActive
                    ? "text-[var(--color-accent-2)]"
                    : "text-[var(--muted-foreground)] hover:text-white active:scale-95"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isActive && "bg-[rgba(var(--color-accent-2-rgb),0.12)] scale-110"
                )}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Profile/Login */}
          {isAuthenticated ? (
            <Link
              href="/me"
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150",
                pathname.startsWith("/u/") || pathname === "/me"
                  ? "text-[var(--color-accent-2)]"
                  : "text-[var(--muted-foreground)] hover:text-white active:scale-95"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all",
                (pathname.startsWith("/u/") || pathname === "/me") && "bg-[rgba(var(--color-accent-2-rgb),0.12)] scale-110"
              )}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-[var(--muted-foreground)] hover:text-white transition-all duration-150 active:scale-95"
            >
              <div className="p-1.5 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[10px] font-medium">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
});
