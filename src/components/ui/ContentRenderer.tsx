"use client";

import { useState, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchWithTimeout } from "@/lib/async-utils";
import { ProfileTooltip } from "../profile/ProfileTooltip";

interface UserData {
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
  };
}

interface ContentRendererProps {
  content: string;
  className?: string;
  currentUserId?: string;
}

export const ContentRenderer = memo(function ContentRenderer({ content, className = "", currentUserId }: ContentRendererProps) {
  const [mentionUsers, setMentionUsers] = useState<Map<string, UserData>>(new Map());
  const router = useRouter();

  const fetchUserData = useCallback(async (username: string) => {
    // Don't fetch if we already have the data
    if (mentionUsers.has(username)) return;
    
    const result = await fetchWithTimeout(`/api/user/${username}`, { timeout: 5000 });
    if (result.success && (result.data as { user?: UserData })?.user) {
      setMentionUsers(prev => new Map(prev).set(username, (result.data as { user: UserData }).user));
    }
  }, [mentionUsers]);

  const renderContentWithLinks = useCallback(() => {
    const parts: React.ReactElement[] = [];
    let lastIndex = 0;
    let partId = 0;

    // Combined regex for hashtags and mentions
    const combinedRegex = /(#([a-zA-Z0-9_]+)|@([a-zA-Z0-9_]+))/g;
    let match;

    while ((match = combinedRegex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        parts.push(
          <span key={`text-${partId++}`}>
            {textBefore}
          </span>
        );
      }

      // Add the hashtag or mention
      const fullMatch = match[0];
      const isHashtag = fullMatch.startsWith('#');
      const value = isHashtag ? match[2] : match[3];

      if (isHashtag) {
        parts.push(
          <button
            type="button"
            key={`hashtag-${match.index}`}
            className="inline rounded-sm text-[var(--color-accent-2)] transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.55)]"
            onClick={() => router.push(`/hashtag/${value}`)}
          >
            {fullMatch}
          </button>
        );
      } else {
        // Render mention with ProfileTooltip
        const userData = mentionUsers.get(value);
        
        if (userData) {
          parts.push(
            <ProfileTooltip
              key={`mention-${match.index}`}
              user={userData}
              currentUserId={currentUserId}
              position="bottom"
            >
              <button
                type="button"
                className="inline rounded-sm text-white transition-colors hover:text-[var(--color-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-rgb),0.45)]"
                onClick={() => router.push(`/u/${value}`)}
                onMouseEnter={() => fetchUserData(value)}
              >
                {fullMatch}
              </button>
            </ProfileTooltip>
          );
        } else {
          parts.push(
            <button
              type="button"
              key={`mention-${match.index}`}
              className="inline rounded-sm text-white transition-colors hover:text-[var(--color-accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-rgb),0.45)]"
              onClick={() => router.push(`/u/${value}`)}
              onMouseEnter={() => fetchUserData(value)}
            >
              {fullMatch}
            </button>
          );
        }
      }

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      parts.push(
        <span key={`text-${partId}`}>
          {remainingText}
        </span>
      );
    }

    return parts;
  }, [content, mentionUsers, currentUserId, fetchUserData, router]);

  return (
    <div className={className}>
      {renderContentWithLinks()}
    </div>
  );
});
