"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import {
  ThemeId,
  ThemeConfig,
  THEME_IDS,
  isThemeId,
  getTheme,
  generateThemeCSSVariables,
  DEFAULT_THEME,
  getLogoPath,
  getFaviconPath,
} from '@/lib/themes';

interface ThemeContextValue {
  theme: ThemeConfig;
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  logoPath: string;
  faviconPath: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'devlink-theme';

function getStoredTheme(): ThemeId | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : null;
  } catch {
    return null;
  }
}

function storeTheme(themeId: ThemeId) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // Theme persistence is optional; rendering should never depend on storage access.
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeId;
}

export function ThemeProvider({ children, defaultTheme = DEFAULT_THEME }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setThemeId(stored);
    }
    setMounted(true);
  }, []);

  // Apply CSS variables whenever theme changes
  useEffect(() => {
    if (!mounted) return;

    const theme = getTheme(themeId);
    const cssVars = generateThemeCSSVariables(theme);
    
    // Apply CSS variables to :root
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    const faviconPath = getFaviconPath(themeId);
    const logoPath = getLogoPath(themeId);

    const ensureIconLink = (rel: string, href: string, type?: string) => {
      const matches = Array.from(document.querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`)).filter(
        (link) => link.getAttribute('href') === href
      );
      const [first, ...duplicates] = matches;
      duplicates.forEach((link) => link.remove());

      if (first) {
        if (type) first.type = type;
        return;
      }

      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (type) link.type = type;
      document.head.appendChild(link);
    };

    const syncThemeIcons = () => {
      // Next metadata can re-emit default icons after hydration. Replace any
      // branded icon link so the active theme is the only DevLink icon set.
      document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"], link[href*="/favicon"], link[href*="/logo/logo"]').forEach((link) => {
        const href = link.getAttribute('href') ?? '';
        const isDevLinkIcon = href.includes('/favicon') || href.includes('/logo/logo');
        const isActiveIcon = href === faviconPath || href === logoPath;
        if (isDevLinkIcon && !isActiveIcon) {
          link.remove();
        }
      });

      ensureIconLink('icon', faviconPath, 'image/x-icon');
      ensureIconLink('shortcut icon', faviconPath);
      ensureIconLink('apple-touch-icon', logoPath);
    };

    syncThemeIcons();
    window.requestAnimationFrame(syncThemeIcons);
    const iconSyncTimer = window.setTimeout(syncThemeIcons, 150);

    // Store in localStorage
    storeTheme(themeId);

    // Add theme class to body for Tailwind-based theming
    document.body.classList.remove(...THEME_IDS.map((id) => `theme-${id}`));
    document.body.classList.add(`theme-${themeId}`);
    return () => {
      window.clearTimeout(iconSyncTimer);
    };
  }, [themeId, mounted]);

  const setTheme = useCallback((newThemeId: ThemeId) => {
    setThemeId(newThemeId);
  }, []);

  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const logoPath = useMemo(() => getLogoPath(themeId), [themeId]);
  const faviconPath = useMemo(() => getFaviconPath(themeId), [themeId]);

  const value = useMemo(() => ({
    theme,
    themeId,
    setTheme,
    logoPath,
    faviconPath,
  }), [theme, themeId, setTheme, logoPath, faviconPath]);

  // Prevent flash of default theme
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{
        theme: getTheme(defaultTheme),
        themeId: defaultTheme,
        setTheme: () => {},
        logoPath: getLogoPath(defaultTheme),
        faviconPath: getFaviconPath(defaultTheme),
      }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook to get theme-aware Tailwind classes
 * Usage: const { accent, accentHover } = useThemeClasses();
 */
export function useThemeClasses() {
  const { theme } = useTheme();
  return theme.tailwind;
}

