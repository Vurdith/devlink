"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/Avatar";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { NavbarSearch } from "./NavbarSearch";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username as string | undefined;
  const googleImage = (session?.user as any)?.image as string | undefined;
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(googleImage);

  useEffect(() => {
    if (username) {
      // For Google users, use Google image directly
      if (googleImage) {
        setAvatarUrl(googleImage);
        return;
      }
      
      // For email/password users, fetch DevLink profile avatar
      fetch(`/api/user/${username}`)
        .then(res => res.json())
        .then(data => {
          if (data.user?.profile?.avatarUrl) {
            setAvatarUrl(data.user.profile.avatarUrl);
          } else {
            setAvatarUrl(undefined);
          }
        })
        .catch(console.error);
    }
  }, [username, googleImage]);
  return (
    <header
      className="sticky top-0 z-40 w-full bg-gradient-to-r from-slate-900/95 via-purple-900/20 to-slate-900/95 backdrop-blur-2xl border-b border-purple-500/20 shadow-2xl"
    >
      {/* Static background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10"></div>
      
      <div className="relative w-full px-6 h-20 flex items-center">
        {/* Search bar - moved to far left */}
        <div className="flex items-center">
          <NavbarSearch />
        </div>

        {/* Spacer to push profile to far right */}
        <div className="flex-1"></div>

        {/* Right side - Existing profile menu (moved to far right) */}
        <div className="flex items-center gap-4">
          {username ? (
            <ProfileMenu username={username} avatarUrl={avatarUrl} />
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:inline-flex">
                <Button
                  variant="ghost"
                  className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:from-purple-500/20 hover:to-blue-500/20 text-purple-200 hover:text-white transition-all duration-300"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-300">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// client dropdown moved to ProfileMenu.tsx


