"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/ui/FollowButton";
import { cn } from "@/lib/cn";
import { ProfileTypeLabel } from "@/components/profile/ProfileTypeLabel";

export type ProfilePreviewUser = {
  id?: string;
  username?: string | null;
  name?: string | null;
  image?: string | null;
  createdAt?: string | Date | null;
  profile?: {
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    bio?: string | null;
    verified?: boolean;
    location?: string | null;
    website?: string | null;
    profileType?: string | null;
  };
  _count?: { followers?: number; following?: number };
};

const PROFILE_GRADIENTS: Record<string, string> = {
  DEVELOPER: "from-[rgba(var(--color-accent-rgb),0.18)] via-[rgba(var(--color-accent-2-rgb),0.10)] to-[rgba(var(--color-accent-3-rgb),0.18)]",
  CLIENT: "from-[rgba(var(--color-accent-rgb),0.18)] via-[rgba(var(--color-accent-2-rgb),0.10)] to-[rgba(var(--color-accent-3-rgb),0.18)]",
  STUDIO: "from-[rgba(var(--color-accent-rgb),0.18)] via-[rgba(var(--color-accent-2-rgb),0.10)] to-[rgba(var(--color-accent-3-rgb),0.18)]",
  INFLUENCER: "from-[rgba(var(--color-accent-rgb),0.18)] via-[rgba(var(--color-accent-2-rgb),0.10)] to-[rgba(var(--color-accent-3-rgb),0.18)]",
  INVESTOR: "from-[rgba(var(--color-accent-rgb),0.18)] via-[rgba(var(--color-accent-2-rgb),0.10)] to-[rgba(var(--color-accent-3-rgb),0.18)]",
  DEFAULT: "from-slate-500/20 via-gray-400/10 to-zinc-500/20",
};

const PROFILE_BORDERS: Record<string, string> = {
  DEVELOPER: "border-[rgba(var(--color-accent-2-rgb),0.40)]",
  CLIENT: "border-[rgba(var(--color-accent-2-rgb),0.40)]",
  STUDIO: "border-[rgba(var(--color-accent-2-rgb),0.40)]",
  INFLUENCER: "border-[rgba(var(--color-accent-2-rgb),0.40)]",
  INVESTOR: "border-[rgba(var(--color-accent-2-rgb),0.40)]",
  DEFAULT: "border-white/20",
};

function formatCount(count: number | undefined | null) {
  if (count == null) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function ProfilePreviewCard({
  user,
  currentUserId,
  onClose,
}: {
  user: ProfilePreviewUser;
  currentUserId?: string;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [fullUser, setFullUser] = useState<ProfilePreviewUser>(user);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  useEffect(() => {
    if (!user.username) return;

    const controller = new AbortController();
    fetch(`/api/user/${encodeURIComponent(user.username)}`, { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json().catch(() => null)) as { user?: ProfilePreviewUser } | null;
      })
      .then((data) => {
        const next = data?.user;
        if (next?.id && next?.username) setFullUser(next);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [user.username]);

  useEffect(() => {
    if (!currentUserId || !fullUser.id || currentUserId === fullUser.id) return;

    setIsLoadingFollow(true);
    fetch(`/api/follow/check?targetUserId=${fullUser.id}`)
      .then((res) => res.json())
      .then((data) => setIsFollowing(data.following))
      .catch(() => setIsFollowing(false))
      .finally(() => setIsLoadingFollow(false));
  }, [currentUserId, fullUser.id]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) onClose();
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const profileType = fullUser.profile?.profileType ?? null;
  const profileGradient = PROFILE_GRADIENTS[profileType || "DEFAULT"] || PROFILE_GRADIENTS.DEFAULT;
  const profileBorderColor = PROFILE_BORDERS[profileType || "DEFAULT"] || PROFILE_BORDERS.DEFAULT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div
        ref={cardRef}
        className={cn(
          "relative w-80 overflow-hidden rounded-xl",
          "bg-[rgba(12,16,23,0.96)]",
          "border",
          profileBorderColor
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className={cn("absolute inset-x-0 top-0 h-32 opacity-40 z-0", `bg-gradient-to-b ${profileGradient} to-transparent`)} />

        <div className="relative h-28 overflow-hidden">
          {fullUser.profile?.bannerUrl ? (
            <>
              <Image src={fullUser.profile.bannerUrl} alt="" fill className="object-cover object-center" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d1117]" />
            </>
          ) : (
            <div className={cn("absolute inset-0", `bg-gradient-to-br ${profileGradient}`, "opacity-60")}>
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            </div>
          )}
        </div>

        <div className="relative px-4 pb-4 -mt-10">
          <div className="flex items-end gap-3 mb-3">
            <button
              onClick={(event) => {
                event.stopPropagation();
                window.location.href = `/u/${fullUser.username}`;
              }}
              className="relative group"
            >
              <div
                className={cn(
                  "absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-300",
                  `bg-gradient-to-br ${profileGradient.replace("/20", "/40")}`
                )}
              />
              <div className={cn("relative rounded-full p-0.5", "bg-gradient-to-br from-[#0d1117] to-[#080b10]", "ring-2 ring-[#0d1117]")}>
                <Avatar src={fullUser.profile?.avatarUrl || fullUser.image || undefined} size={56} />
              </div>
            </button>

            <div className="flex-1 min-w-0 pb-1">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  window.location.href = `/u/${fullUser.username}`;
                }}
                className="group flex items-center gap-1.5"
              >
                <span className="font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors truncate">
                  {fullUser.name || fullUser.username}
                </span>
                {fullUser.profile?.verified && (
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-[rgba(var(--color-accent-2-rgb),0.50)] rounded-full" />
                    <svg className="relative w-4 h-4 text-[var(--color-accent-2)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </button>
              <div className="text-sm text-[var(--muted-foreground)]">@{fullUser.username}</div>
            </div>
          </div>

          {profileType && (
            <div className="mb-3">
              <ProfileTypeLabel profileType={profileType} variant="inline" />
            </div>
          )}

          {fullUser.profile?.bio && <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3 leading-relaxed">{fullUser.profile.bio}</p>}

          {(fullUser.profile?.location || fullUser.profile?.website) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-xs text-[var(--muted-foreground)]">
              {fullUser.profile?.location && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[var(--muted-foreground)]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate max-w-[120px]">{fullUser.profile.location}</span>
                </div>
              )}
              {fullUser.profile?.website && (
                <a
                  href={fullUser.profile.website.startsWith("http") ? fullUser.profile.website : `https://${fullUser.profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  onClick={(event) => event.stopPropagation()}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span className="truncate max-w-[100px]">{fullUser.profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                </a>
              )}
            </div>
          )}

          {fullUser._count && (fullUser._count.followers != null || fullUser._count.following != null) && (
            <div className="flex gap-4 mb-4">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  window.location.href = `/u/${fullUser.username}/followers`;
                }}
                className="group flex items-center gap-1.5 text-sm hover:text-[var(--color-accent)] transition-colors"
              >
                <span className="font-bold text-white group-hover:text-[var(--color-accent)] transition-colors">{formatCount(fullUser._count.followers)}</span>
                <span className="text-[var(--muted-foreground)] text-xs">followers</span>
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  window.location.href = `/u/${fullUser.username}/following`;
                }}
                className="group flex items-center gap-1.5 text-sm hover:text-[var(--color-accent)] transition-colors"
              >
                <span className="font-bold text-white group-hover:text-[var(--color-accent)] transition-colors">{formatCount(fullUser._count.following)}</span>
                <span className="text-[var(--muted-foreground)] text-xs">following</span>
              </button>
            </div>
          )}

          {currentUserId && fullUser.id && currentUserId !== fullUser.id && (
            <div className="relative">
              {isLoadingFollow ? (
                <div className="h-10 rounded-xl bg-white/5 animate-pulse flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[var(--color-accent)]/30 border-r-[var(--color-accent)] rounded-full animate-spin" />
                </div>
              ) : (
                <FollowButton targetUserId={fullUser.id} initialFollowing={isFollowing} onToggle={(following) => setIsFollowing(following)} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
