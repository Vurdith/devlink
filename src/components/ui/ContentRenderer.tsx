"use client";

import { useState, useRef, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchWithTimeout } from "@/lib/async-utils";
import { ProfileTooltip } from "./ProfileTooltip";

interface ContentRendererProps {
  content: string;
  className?: string;
  currentUserId?: string;
}

export const ContentRenderer = memo(function ContentRenderer({ content, className = "", currentUserId }: ContentRendererProps) {
  const [mentionUsers, setMentionUsers] = useState<Map<string, any>>(new Map());
  const router = useRouter();

  const fetchUserData = useCallback(async (username: string) => {
    // Don't fetch if we already have the data
    if (mentionUsers.has(username)) return;
    
    const result = await fetchWithTimeout(`/api/user/${username}`, { timeout: 5000 });
    if (result.success && result.data?.user) {
      setMentionUsers(prev => new Map(prev).set(username, result.data.user));
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
          <span
            key={`hashtag-${match.index}`}
            className="text-blue-400 hover:text-blue-300 cursor-pointer hover:underline transition-colors"
            onClick={() => router.push(`/hashtag/${value}`)}
          >
            {fullMatch}
          </span>
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
              <span
                className="text-white hover:text-purple-400 cursor-pointer hover:underline transition-colors"
                onClick={() => router.push(`/u/${value}`)}
                onMouseEnter={() => fetchUserData(value)}
              >
                {fullMatch}
              </span>
            </ProfileTooltip>
          );
        } else {
          parts.push(
            <span
              key={`mention-${match.index}`}
              className="text-white hover:text-purple-400 cursor-pointer hover:underline transition-colors"
              onClick={() => router.push(`/u/${value}`)}
              onMouseEnter={() => fetchUserData(value)}
            >
              {fullMatch}
            </span>
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
  }, [content, mentionUsers, currentUserId, fetchUserData]);

  return (
    <div className={className}>
      {renderContentWithLinks()}
    </div>
  );
});
