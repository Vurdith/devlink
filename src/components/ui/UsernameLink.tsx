"use client";

import { memo } from "react";
import { ProfileTooltip } from "../profile/ProfileTooltip";

interface User {
  id: string;
  username: string;
  name: string | null;
  profile: {
    avatarUrl: string | null;
    bannerUrl?: string | null;
    bio?: string | null;
    profileType?: string | null;
    verified?: boolean;
    website?: string | null;
    location?: string | null;
  } | null;
  _count?: {
    followers: number;
    following: number;
  };
}

interface UsernameLinkProps {
  user: User;
  currentUserId?: string;
  className?: string;
  showAtSign?: boolean;
}

export const UsernameLink = memo(function UsernameLink({
  user,
  currentUserId,
  className = "",
  showAtSign = false,
}: UsernameLinkProps) {
  return (
    <ProfileTooltip user={user} currentUserId={currentUserId}>
      <a
        href={`/u/${user.username}`}
        className={`font-medium text-white hover:underline transition-colors ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showAtSign ? "@" : ""}
        {user.name || user.username}
      </a>
    </ProfileTooltip>
  );
});

interface UsernameHandleProps {
  username: string;
  className?: string;
}

export const UsernameHandle = memo(function UsernameHandle({
  username,
  className = "",
}: UsernameHandleProps) {
  return (
    <span className={`text-[var(--muted-foreground)] ${className}`}>
      @{username}
    </span>
  );
});
