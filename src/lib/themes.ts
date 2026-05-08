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
    name: 'Signal Violet',
    description: 'Violet primary with cyan and emerald product accents',
    colors: {
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      accentGlow: 'rgba(139, 92, 246, 0.28)',
      accent2: '#22d3ee',
      accent2Glow: 'rgba(34, 211, 238, 0.18)',
      accent3: '#34d399',
      accent3Glow: 'rgba(52, 211, 153, 0.16)',
      accentRgb: '139, 92, 246',
      accent2Rgb: '34, 211, 238',
      accent3Rgb: '52, 211, 153',
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
    name: 'Crimson Signal',
    description: 'Crimson primary with warm and cyan supporting accents',
    colors: {
      accent: '#dc2626',
      accentHover: '#b91c1c',
      accentGlow: 'rgba(220, 38, 38, 0.26)',
      accent2: '#f59e0b',
      accent2Glow: 'rgba(245, 158, 11, 0.18)',
      accent3: '#22d3ee',
      accent3Glow: 'rgba(34, 211, 238, 0.16)',
      accentRgb: '220, 38, 38',
      accent2Rgb: '245, 158, 11',
      accent3Rgb: '34, 211, 238',
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

