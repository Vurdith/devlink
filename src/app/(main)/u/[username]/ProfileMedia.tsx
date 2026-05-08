"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarEditOverlay, BannerEditOverlay } from "./MediaEditor";

interface ProfileBannerProps {
  initialBannerUrl?: string | null;
  isOwnProfile: boolean;
}

interface ProfileAvatarProps {
  initialAvatarUrl?: string | null;
  isOwnProfile: boolean;
}

// Shared hook for listening to profile updates
function useProfileUpdates() {
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>();
  const [bannerUrl, setBannerUrl] = useState<string | null | undefined>();

  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { avatarUrl: newAvatar, bannerUrl: newBanner } = event.detail || {};
      
      if (newAvatar !== undefined) {
        setAvatarUrl(newAvatar);
      }
      if (newBanner !== undefined) {
        setBannerUrl(newBanner);
      }
    };

    window.addEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener('devlink:profile-updated', handleProfileUpdate as EventListener);
    };
  }, []);

  return { avatarUrl, bannerUrl };
}

export function ProfileBanner({ initialBannerUrl, isOwnProfile }: ProfileBannerProps) {
  const { bannerUrl: updatedBannerUrl } = useProfileUpdates();
  const bannerUrl = updatedBannerUrl !== undefined ? updatedBannerUrl : initialBannerUrl;
  const isBlob = bannerUrl?.startsWith('blob:');

  return (
    <div className="relative z-0 h-36 sm:h-64 w-full group">
      {bannerUrl ? (
        // Use regular img for blob URLs (instant local preview), next/image for remote URLs
        isBlob ? (
          <img 
            src={bannerUrl} 
            alt="Banner" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <Image 
            src={bannerUrl} 
            alt="Banner" 
            fill 
            className="object-cover object-center" 
            priority 
            key={bannerUrl}
          />
        )
      ) : (
        <div className="h-full w-full bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(var(--color-accent-rgb),0.28)_45%,rgba(var(--color-accent-2-rgb),0.24))]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <BannerEditOverlay editable={isOwnProfile} />
    </div>
  );
}

export function ProfileAvatar({ initialAvatarUrl, isOwnProfile }: ProfileAvatarProps) {
  const { avatarUrl: updatedAvatarUrl } = useProfileUpdates();
  const avatarUrl = updatedAvatarUrl !== undefined ? updatedAvatarUrl : initialAvatarUrl;

  return (
    <div className="relative z-20">
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 group">
        {/* Subtle glow behind avatar */}
        <div className="absolute -inset-1 bg-gradient-to-br from-white/12 via-[rgba(var(--color-accent-2-rgb),0.2)] to-[rgba(var(--color-accent-rgb),0.14)] rounded-full opacity-70" />
        <div className="relative w-full h-full rounded-full border-4 border-[rgb(10,13,19)] overflow-hidden flex items-center justify-center shadow-[0_12px_38px_rgba(0,0,0,0.35)]">
          <Avatar 
            className="w-full h-full object-cover" 
            src={avatarUrl || undefined} 
            key={avatarUrl || 'no-avatar'}
          />
        </div>
        <AvatarEditOverlay editable={isOwnProfile} />
      </div>
    </div>
  );
}

