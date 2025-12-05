"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { BackButton } from "@/components/ui/BackButton";
import { ThemeLogoImg } from "@/components/ui/ThemeLogo";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  requiresAuth?: boolean;
}

const navigation: NavItem[] = [
  {
    name: "Home",
    href: "/home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: "Your personalized feed"
  },
  {
    name: "Discover",
    href: "/discover",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: "Find new creators"
  },
];

const userNavigation: NavItem[] = [
  {
    name: "My Profile",
    href: "/me",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    description: "View your profile",
    requiresAuth: true
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: "Account settings",
    requiresAuth: true
  },
];

// Memoized nav link component matching desktop Sidebar exactly
const NavLink = memo(function NavLink({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150",
        isActive 
          ? "bg-[rgba(var(--color-accent-rgb),0.15)] text-white" 
          : "text-[var(--muted-foreground)] hover:text-white hover:bg-[rgba(var(--color-accent-rgb),0.1)]"
      )}
      title={item.description}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-accent-hover)] rounded-r-full" />
      )}
      
      {/* Icon */}
      <div className={cn(
        "p-2 rounded-lg transition-colors duration-150",
        isActive 
          ? "bg-[rgba(var(--color-accent-rgb),0.2)] text-[var(--color-accent)]" 
          : "text-[var(--muted-foreground)] group-hover:text-[var(--color-accent)] group-hover:bg-[rgba(var(--color-accent-rgb),0.1)]"
      )}>
        {item.icon}
      </div>
      
      {/* Text */}
      <span className="font-medium">{item.name}</span>
      
      {/* Arrow */}
      <svg
        className={cn(
          "ml-auto w-4 h-4 transition-opacity duration-150",
          isActive ? "text-[var(--color-accent)] opacity-100" : "opacity-0 group-hover:opacity-50"
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

export const MobileNav = memo(function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button - Fixed in top left, vertically centered in navbar (h-16 = 64px, button ~44px) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-[10px] left-4 z-50 p-2.5 rounded-xl bg-[#0a0a0f] border border-white/10 hover:border-[var(--color-accent)]/30 transition-all duration-150 hover:scale-105 active:scale-95"
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
          className="md:hidden fixed inset-0 bg-black/80 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu - Exact same styling as desktop Sidebar */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-out bg-[#0a0a0f] border-r border-white/5",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative flex flex-col h-full">
          {/* Logo Section - matching Sidebar */}
          <div className="p-6 border-b border-white/5">
            <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
              <ThemeLogoImg className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-xl font-bold gradient-text font-[var(--font-space-grotesk)]">
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
              className="w-full justify-start glass-hover rounded-xl text-[var(--muted-foreground)] hover:text-white border-0" 
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
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] text-white font-medium hover:from-[var(--color-accent-hover)] hover:to-[var(--color-accent-hover)] transition-all shadow-lg shadow-[rgba(var(--color-accent-rgb),0.2)]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="8.5" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="20" y1="8" x2="20" y2="14" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="23" y1="11" x2="17" y2="11" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </nav>

          {/* Bottom section - matching Sidebar */}
          <div className="p-4 border-t border-[rgba(var(--color-accent-rgb),0.1)]">
            <div className="rounded-xl p-4 text-center space-y-2 bg-[rgba(var(--color-accent-rgb),0.05)] border border-[rgba(var(--color-accent-rgb),0.2)]">
              <p className="text-xs font-medium text-[var(--color-accent)]">
                Connect • Create • Grow
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                Powered by the Roblox Community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0f] border-t border-white/10 safe-area-bottom">
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
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--muted-foreground)] hover:text-white active:scale-95"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all",
                  isActive && "bg-[rgba(var(--color-accent-rgb),0.2)] scale-110"
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
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--muted-foreground)] hover:text-white active:scale-95"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all",
                (pathname.startsWith("/u/") || pathname === "/me") && "bg-[rgba(var(--color-accent-rgb),0.2)] scale-110"
              )}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
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
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
