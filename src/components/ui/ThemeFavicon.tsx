"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * Client component that manages the favicon based on the current theme.
 * Must be rendered in the layout to take effect.
 */
export function ThemeFavicon() {
  const { themeId } = useTheme();

  useEffect(() => {
    // Remove all existing favicons
    const existingIcons = document.querySelectorAll('link[rel*="icon"]');
    existingIcons.forEach(icon => icon.remove());

    // Create new favicon with correct theme
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/x-icon';
    favicon.href = `/favicon-${themeId}.ico`;
    document.head.appendChild(favicon);

    // Also add shortcut icon for older browsers
    const shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    shortcut.href = `/favicon-${themeId}.ico`;
    document.head.appendChild(shortcut);

    // Clean up on unmount or theme change
    return () => {
      favicon.remove();
      shortcut.remove();
    };
  }, [themeId]);

  return null;
}

