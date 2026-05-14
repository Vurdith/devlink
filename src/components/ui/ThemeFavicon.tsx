"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { getFaviconPath } from "@/lib/themes";

/**
 * Client component that manages the favicon based on the current theme.
 * Must be rendered in the layout to take effect.
 */
export function ThemeFavicon() {
  const { themeId } = useTheme();

  useEffect(() => {
    const faviconPath = getFaviconPath(themeId);

    const ensureThemeIcon = (rel: string, href: string, type?: string) => {
      const selector = `link[data-devlink-theme-icon="true"][rel="${rel}"]`;
      let link = document.querySelector<HTMLLinkElement>(selector);

      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        link.dataset.devlinkThemeIcon = 'true';
        document.head.appendChild(link);
      }

      link.href = href;
      if (type) link.type = type;
      else link.removeAttribute('type');
    };

    ensureThemeIcon('icon', faviconPath, 'image/x-icon');
    ensureThemeIcon('shortcut icon', faviconPath);
  }, [themeId]);

  return null;
}

