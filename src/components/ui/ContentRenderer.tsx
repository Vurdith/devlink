"use client";

import { useState, useRef, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    
    try {
      const response = await fetch(`/api/user/${username}`);
      if (response.ok) {
        const data = await response.json();
        setMentionUsers(prev => new Map(prev).set(username, data.user));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [mentionUsers]);

  const renderContentWithLinks = useCallback(() => {
    const parts: React.ReactElement[] = [];
    let lastIndex = 0;
    let key = 0;

    // Combined regex for hashtags and mentions
    const combinedRegex = /(#([a-zA-Z0-9_]+)|@([a-zA-Z0-9_]+))/g;
    let match;

    while ((match = combinedRegex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(
          <span key={key++}>
            {content.slice(lastIndex, match.index)}
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
            key={key++}
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
              key={key++}
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
              key={key++}
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
      parts.push(
        <span key={key++}>
          {content.slice(lastIndex)}
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
