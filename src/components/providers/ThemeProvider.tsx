"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { ThemeId, ThemeConfig, getTheme, generateThemeCSSVariables, DEFAULT_THEME, getLogoPath, getFaviconPath } from '@/lib/themes';

interface ThemeContextValue {
  theme: ThemeConfig;
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  logoPath: string;
  faviconPath: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'devlink-theme';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeId;
}

export function ThemeProvider({ children, defaultTheme = DEFAULT_THEME }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (stored && (stored === 'purple' || stored === 'red')) {
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

    // Update favicon
    const faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = getFaviconPath(themeId);
    }

    // Update apple-touch-icon
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (appleTouchIcon) {
      appleTouchIcon.href = getLogoPath(themeId);
    }

    // Store in localStorage
    localStorage.setItem(THEME_STORAGE_KEY, themeId);

    // Add theme class to body for Tailwind-based theming
    document.body.classList.remove('theme-purple', 'theme-red');
    document.body.classList.add(`theme-${themeId}`);
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

