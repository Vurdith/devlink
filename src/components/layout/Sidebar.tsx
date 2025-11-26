"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BackButton } from "@/components/ui/BackButton";
import { useSession } from "next-auth/react";
import { memo } from "react";

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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: "Account settings",
    requiresAuth: true
  },
];

// Memoized nav link for better performance
const NavLink = memo(function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      prefetch={true}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150",
        isActive 
          ? "bg-purple-500/15 text-white" 
          : "text-[var(--muted-foreground)] hover:text-white hover:bg-purple-500/10"
      )}
      title={item.description}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-r-full" />
      )}
      
      {/* Icon */}
      <div className={cn(
        "p-2 rounded-lg transition-colors duration-150",
        isActive 
          ? "bg-purple-500/20 text-purple-400" 
          : "text-[var(--muted-foreground)] group-hover:text-purple-400 group-hover:bg-purple-500/10"
      )}>
        {item.icon}
      </div>
      
      {/* Text */}
      <span className="font-medium">{item.name}</span>
      
      {/* Arrow */}
      <svg
        className={cn(
          "ml-auto w-4 h-4 transition-opacity duration-150",
          isActive ? "text-purple-400 opacity-100" : "opacity-0 group-hover:opacity-50"
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

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-72 z-40 flex-col">
      {/* Background */}
      <div className="absolute inset-0 glass border-r border-white/5" />
      
      {/* Gradient accents */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-600/5 to-transparent pointer-events-none" />
      
      <div className="relative flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group" prefetch={true}>
            <img
              src="/logo/logo.png"
              alt="DevLink"
              className="w-10 h-10 object-contain"
              loading="eager"
            />
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

        {/* Back Button */}
        <div className="px-4 pt-4">
          <BackButton className="w-full justify-start glass-hover rounded-xl text-[var(--muted-foreground)] hover:text-white border-0" />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
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
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                  <span className="text-[10px] text-purple-400/60 uppercase tracking-widest">Account</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
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

        {/* Bottom section */}
        <div className="p-4 border-t border-purple-500/10">
          <div className="rounded-xl p-4 text-center space-y-2 bg-purple-500/5 border border-purple-500/20">
            <p className="text-xs font-medium text-purple-300">
              Connect • Create • Grow
            </p>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              Powered by the Roblox Community
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
});
