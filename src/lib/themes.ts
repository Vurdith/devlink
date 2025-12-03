/**
 * DevLink Theme System
 * 
 * Centralized theme configuration with color palettes.
 * All colors are defined here and injected as CSS variables.
 * 
 * To add a new theme:
 * 1. Add the theme ID to ThemeId type
 * 2. Add the theme config to THEMES object
 * 3. Add logo files: /public/logo/logo-{themeId}.png
 * 4. Add favicon files: /public/favicon-{themeId}.ico
 */

export type ThemeId = 'purple' | 'red';

export interface ThemeColors {
  // Primary accent colors
  accent: string;
  accentHover: string;
  accentGlow: string;
  
  // Secondary accent
  accent2: string;
  accent2Glow: string;
  
  // Tertiary accent  
  accent3: string;
  accent3Glow: string;
  
  // RGB values for rgba() usage
  accentRgb: string;
  accent2Rgb: string;
  accent3Rgb: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  colors: ThemeColors;
  // Tailwind class mappings for components
  tailwind: {
    // Main accent classes
    accent: string;        // e.g., 'red-600' or 'purple-500'
    accentHover: string;   // e.g., 'red-700' or 'purple-600'
    accentLight: string;   // e.g., 'red-400' or 'purple-400'
    accentDark: string;    // e.g., 'red-800' or 'purple-800'
    // For borders, backgrounds with opacity
    accentBorder: string;  // e.g., 'red-600/30' or 'purple-500/30'
    accentBg: string;      // e.g., 'red-600/10' or 'purple-500/10'
    accentText: string;    // e.g., 'red-500' or 'purple-400'
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Classic purple theme with violet accents',
    colors: {
      accent: '#a855f7',
      accentHover: '#9333ea',
      accentGlow: 'rgba(168, 85, 247, 0.4)',
      accent2: '#c084fc',
      accent2Glow: 'rgba(192, 132, 252, 0.3)',
      accent3: '#e879f9',
      accent3Glow: 'rgba(232, 121, 249, 0.3)',
      accentRgb: '168, 85, 247',
      accent2Rgb: '192, 132, 252',
      accent3Rgb: '232, 121, 249',
    },
    tailwind: {
      accent: 'purple-500',
      accentHover: 'purple-600',
      accentLight: 'purple-400',
      accentDark: 'purple-700',
      accentBorder: 'purple-500/30',
      accentBg: 'purple-500/10',
      accentText: 'purple-400',
    },
  },
  red: {
    id: 'red',
    name: 'Crimson Red',
    description: 'Bold crimson theme with rose accents',
    colors: {
      accent: '#dc2626',
      accentHover: '#b91c1c',
      accentGlow: 'rgba(220, 38, 38, 0.4)',
      accent2: '#ef4444',
      accent2Glow: 'rgba(239, 68, 68, 0.3)',
      accent3: '#f43f5e',
      accent3Glow: 'rgba(244, 63, 94, 0.3)',
      accentRgb: '220, 38, 38',
      accent2Rgb: '239, 68, 68',
      accent3Rgb: '244, 63, 94',
    },
    tailwind: {
      accent: 'red-600',
      accentHover: 'red-700',
      accentLight: 'red-400',
      accentDark: 'red-800',
      accentBorder: 'red-600/30',
      accentBg: 'red-600/10',
      accentText: 'red-500',
    },
  },
};

export const DEFAULT_THEME: ThemeId = 'purple';

/**
 * Get theme configuration by ID
 */
export function getTheme(themeId: ThemeId): ThemeConfig {
  return THEMES[themeId] || THEMES[DEFAULT_THEME];
}

/**
 * Get all available themes
 */
export function getAllThemes(): ThemeConfig[] {
  return Object.values(THEMES);
}

/**
 * Generate CSS variables for a theme
 */
export function generateThemeCSSVariables(theme: ThemeConfig): Record<string, string> {
  return {
    '--color-accent': theme.colors.accent,
    '--color-accent-hover': theme.colors.accentHover,
    '--color-accent-glow': theme.colors.accentGlow,
    '--color-accent-2': theme.colors.accent2,
    '--color-accent-2-glow': theme.colors.accent2Glow,
    '--color-accent-3': theme.colors.accent3,
    '--color-accent-3-glow': theme.colors.accent3Glow,
    '--color-accent-rgb': theme.colors.accentRgb,
    '--color-accent-2-rgb': theme.colors.accent2Rgb,
    '--color-accent-3-rgb': theme.colors.accent3Rgb,
  };
}

/**
 * Get logo path for theme
 * Falls back to default logo if themed version doesn't exist
 */
export function getLogoPath(themeId: ThemeId): string {
  // Themed logos should be named: logo-purple.png, logo-red.png
  // Falls back to logo.png if themed version doesn't exist
  return `/logo/logo-${themeId}.png`;
}

/**
 * Get default logo path (for fallback)
 */
export function getDefaultLogoPath(): string {
  return '/logo/logo.png';
}

/**
 * Get favicon path for theme
 */
export function getFaviconPath(themeId: ThemeId): string {
  return `/favicon-${themeId}.ico`;
}

/**
 * Get default favicon path (for fallback)
 */
export function getDefaultFaviconPath(): string {
  return '/favicon.ico';
}

