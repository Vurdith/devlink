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
    <div className="relative h-36 sm:h-64 w-full group">
      {bannerUrl ? (
        // Use regular img for blob URLs (instant local preview), next/image for remote URLs
        isBlob ? (
          <img 
            src={bannerUrl} 
            alt="Banner" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image 
            src={bannerUrl} 
            alt="Banner" 
            fill 
            className="object-cover" 
            priority 
            key={bannerUrl}
          />
        )
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-red-900/50 via-red-800/30 to-rose-900/50" />
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
    <div className="relative -mt-12 sm:-mt-16 z-20">
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 group">
        {/* Grey glow circle behind avatar */}
        <div className="absolute -inset-1 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-50 blur-sm" />
        <div className="relative w-full h-full rounded-full border-4 border-[#0a0a0f] overflow-hidden flex items-center justify-center">
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

