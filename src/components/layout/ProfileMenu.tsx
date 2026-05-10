"use client";

import { useCallback, useEffect, useState, useRef, memo } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { ChevronDown, ChevronRight, LogOut, Settings, UserRound } from "lucide-react";
import { iconBox, menuItem, menuPanel, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";

interface ProfileMenuProps {
  username: string;
  avatarUrl?: string;
  name?: string | null;
  profileType?: string;
}

const menuItems = [
  {
    href: "/me",
    label: "Profile",
    description: "Open your public page",
    icon: <UserRound className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Account and security",
    icon: <Settings className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
];

export const ProfileMenu = memo(function ProfileMenu({ username, avatarUrl: initialAvatarUrl, name, profileType }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [updatedAvatarUrl, setUpdatedAvatarUrl] = useState<string | undefined>();
  const menuRef = useRef<HTMLDivElement>(null);
  const currentAvatarUrl = updatedAvatarUrl ?? initialAvatarUrl;

  useEffect(() => {
    setUpdatedAvatarUrl(undefined);
  }, [initialAvatarUrl]);

  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { avatarUrl: newAvatar } = event.detail || {};
      if (newAvatar !== undefined) {
        setUpdatedAvatarUrl(newAvatar);
      }
    };

    window.addEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const closeMenu = useCallback(() => setOpen(false), []);
  const toggleMenu = useCallback(() => setOpen((current) => !current), []);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-150 active:scale-[0.98]",
          open
            ? ui.active.cyan
            : ui.control.ghost
        )}
        onClick={toggleMenu}
      >
        <Avatar size={36} src={currentAvatarUrl} />
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-white leading-tight">
            {name || username}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            @{username}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-[var(--muted-foreground)] transition-transform duration-200 sm:block",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={cn(
            "absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-2rem))]",
            menuPanel(),
            "origin-top-right animate-fade-in"
          )}
          role="menu"
        >
          {/* Header with user info */}
          <div className="border-b border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center gap-3">
              <Avatar size={48} src={currentAvatarUrl} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">
                  {name || username}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  @{username}
                </div>
                {profileType && (
                  <div className="mt-1">
                    <ProfileTypeLabel profileType={profileType} variant="compact" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={menuItem()}
                role="menuitem"
              >
                <div className={iconBox("cyan", "h-9 w-9 transition-colors group-hover:border-[rgba(var(--color-accent-2-rgb),0.28)] group-hover:bg-[rgba(var(--color-accent-2-rgb),0.13)]")}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">
                    {item.label}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {item.description}
                  </div>
                </div>
                <ChevronRight
                  className="text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="mx-3 h-px bg-white/[0.08]" />

          {/* Sign out */}
          <div className="p-2">
            <button
              type="button"
              onClick={handleSignOut}
              className={cn("w-full", ui.menu.dangerItem)}
              role="menuitem"
            >
              <div className={iconBox("danger", "h-9 w-9 transition-colors group-hover:border-rose-400/30 group-hover:bg-rose-500/15")}>
                <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-rose-200">
                  Sign out
                </div>
                <div className="text-xs text-rose-200/55">
                  End your session
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
