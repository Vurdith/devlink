"use client";

import { useState, useEffect, memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BackButton } from "@/components/ui/BackButton";
import { ThemeLogoImg } from "@/components/ui/ThemeLogo";
import { ui } from "@/components/ui/design-system";
import { navigation, userNavigation } from "@/config/navigation";
import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";
import { NavLinkItem } from "@/components/layout/NavLinkItem";
import { isNavItemActive } from "@/components/layout/nav-state";

interface MobileNavProps {
  session?: { user?: { id?: string; username?: string; name?: string; image?: string } } | null;
}

export const MobileNav = memo(function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = !!session;
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((current) => !current), []);
  const isProfileActive = pathname.startsWith("/u/") || pathname === "/me";
  const bottomItems = useMemo(
    () => navigation.map((item) => ({ item, isActive: isNavItemActive(pathname, item) })),
    [pathname]
  );

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useBodyScrollLock(isOpen);

  return (
    <>
      <button
        onClick={toggleMenu}
        className={cn("fixed left-3 top-[10px] z-50 min-h-11 min-w-11 p-2.5 sm:left-4 md:hidden", ui.control.icon)}
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
          onClick={closeMenu}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[min(18rem,calc(100vw-1rem))] transform-gpu border-0 border-r border-white/[0.08] bg-[rgba(7,9,13,0.94)] transition-transform duration-300 ease-out will-change-transform md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative flex flex-col h-full">
          <div className="border-b border-white/5 p-5 sm:p-6">
            <Link href="/" className="flex items-center gap-3 group" onClick={closeMenu} prefetch={false}>
              <ThemeLogoImg className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-white font-[var(--font-space-grotesk)] tracking-tight">
                  DevLink
                </h1>
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">
                  Roblox hiring
                </p>
              </div>
            </Link>
          </div>

          <div className="px-3 pt-4 sm:px-4">
            <BackButton
              className="min-h-11 w-full justify-start rounded-lg border border-white/[0.08] bg-white/[0.035] text-[var(--muted-foreground)] hover:bg-white/[0.065] hover:text-white"
              onClick={closeMenu}
            />
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLinkItem
                  key={item.name}
                  item={item}
                  isActive={isNavItemActive(pathname, item)}
                  onClick={closeMenu}
                />
              ))}
            </div>

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
                      onClick={closeMenu}
                    />
                  ))}
                </div>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-rgb),0.2)] to-transparent" />
                    <span className="text-[10px] text-[rgba(var(--color-accent-rgb),0.6)] uppercase tracking-widest">Sign in</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-rgb),0.2)] to-transparent" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/login"
                    prefetch={false}
                    onClick={closeMenu}
                    className={cn("flex w-full items-center justify-center gap-2 rounded-lg py-3 text-white transition-colors", ui.control.ghost)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    prefetch={false}
                    onClick={closeMenu}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(var(--color-accent-2-rgb),0.34)] bg-[linear-gradient(135deg,var(--color-accent),rgba(var(--color-accent-2-rgb),0.92))] py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
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
      <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-40 max-w-[100vw] overflow-hidden border-0 border-t border-white/[0.08] bg-[rgba(7,9,13,0.94)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid h-16 w-full max-w-[34rem] min-w-0 grid-cols-5 items-center gap-0.5 px-1">
          {bottomItems.map(({ item, isActive }) => {
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={false}
                className={cn(
                  "relative flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors duration-150",
                  isActive
                    ? "text-[var(--color-accent-2)]"
                    : "text-[var(--muted-foreground)] hover:text-white active:scale-95"
                )}
              >
                <span className={cn("absolute top-1 h-0.5 w-5 rounded-full bg-[var(--color-accent-2)] transition-opacity", isActive ? "opacity-100" : "opacity-0")} />
                <div className={cn(
                  "rounded-md p-1.5 transition-colors",
                  isActive && "bg-[rgba(var(--color-accent-2-rgb),0.12)]"
                )}>
                  {item.icon}
                </div>
                <span className="max-w-full truncate text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Profile/Login */}
          {isAuthenticated ? (
            <Link
              href="/me"
              prefetch={false}
              className={cn(
                "relative flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 transition-colors duration-150",
                isProfileActive
                  ? "text-[var(--color-accent-2)]"
                  : "text-[var(--muted-foreground)] hover:text-white active:scale-95"
              )}
            >
              <span className={cn("absolute top-1 h-0.5 w-5 rounded-full bg-[var(--color-accent-2)] transition-opacity", isProfileActive ? "opacity-100" : "opacity-0")} />
              <div className={cn(
                "rounded-md p-1.5 transition-colors",
                isProfileActive && "bg-[rgba(var(--color-accent-2-rgb),0.12)]"
              )}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <span className="max-w-full truncate text-[10px] font-medium">Profile</span>
            </Link>
          ) : (
            <Link
              href="/login"
              prefetch={false}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[var(--muted-foreground)] transition-all duration-150 hover:text-white active:scale-95"
            >
              <div className="p-1.5 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="max-w-full truncate text-[10px] font-medium">Sign in</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
});
