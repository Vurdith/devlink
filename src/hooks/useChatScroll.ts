"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to manage chat scroll behavior.
 * Keeps the scroll at the bottom when new messages arrive if the user is already near the bottom.
 */
export function useChatScroll<T>(dep: T) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const { scrollHeight, clientHeight, scrollTop } = ref.current;
      const isNearBottom = scrollHeight - clientHeight - scrollTop < 150;

      if (isNearBottom) {
        ref.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [dep]);

  // Initial scroll to bottom
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  return ref;
}
