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

export const THEME_IDS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

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
  red: {
    id: 'red',
    name: 'Signal Red',
    description: 'A focused red theme with matching red icon accents',
    colors: {
      accent: '#ef4444',
      accentHover: '#dc2626',
      accentGlow: 'rgba(239, 68, 68, 0.26)',
      accent2: '#f87171',
      accent2Glow: 'rgba(248, 113, 113, 0.16)',
      accent3: '#991b1b',
      accent3Glow: 'rgba(153, 27, 27, 0.18)',
      accentRgb: '239, 68, 68',
      accent2Rgb: '248, 113, 113',
      accent3Rgb: '153, 27, 27',
    },
    tailwind: {
      accent: 'red-500',
      accentHover: 'red-600',
      accentLight: 'red-400',
      accentDark: 'red-800',
      accentBorder: 'red-500/30',
      accentBg: 'red-500/10',
      accentText: 'red-400',
    },
  },
  orange: {
    id: 'orange',
    name: 'Signal Orange',
    description: 'A clean orange theme with matching orange icon accents',
    colors: {
      accent: '#f97316',
      accentHover: '#ea580c',
      accentGlow: 'rgba(249, 115, 22, 0.25)',
      accent2: '#fb923c',
      accent2Glow: 'rgba(251, 146, 60, 0.15)',
      accent3: '#9a3412',
      accent3Glow: 'rgba(154, 52, 18, 0.18)',
      accentRgb: '249, 115, 22',
      accent2Rgb: '251, 146, 60',
      accent3Rgb: '154, 52, 18',
    },
    tailwind: {
      accent: 'orange-500',
      accentHover: 'orange-600',
      accentLight: 'orange-400',
      accentDark: 'orange-800',
      accentBorder: 'orange-500/30',
      accentBg: 'orange-500/10',
      accentText: 'orange-400',
    },
  },
  yellow: {
    id: 'yellow',
    name: 'Signal Yellow',
    description: 'A yellow theme with gold-toned icon accents',
    colors: {
      accent: '#eab308',
      accentHover: '#ca8a04',
      accentGlow: 'rgba(234, 179, 8, 0.22)',
      accent2: '#fde047',
      accent2Glow: 'rgba(253, 224, 71, 0.13)',
      accent3: '#854d0e',
      accent3Glow: 'rgba(133, 77, 14, 0.18)',
      accentRgb: '234, 179, 8',
      accent2Rgb: '253, 224, 71',
      accent3Rgb: '133, 77, 14',
    },
    tailwind: {
      accent: 'yellow-500',
      accentHover: 'yellow-600',
      accentLight: 'yellow-300',
      accentDark: 'yellow-800',
      accentBorder: 'yellow-500/30',
      accentBg: 'yellow-500/10',
      accentText: 'yellow-300',
    },
  },
  green: {
    id: 'green',
    name: 'Signal Green',
    description: 'A sharp green theme with matching green icon accents',
    colors: {
      accent: '#22c55e',
      accentHover: '#16a34a',
      accentGlow: 'rgba(34, 197, 94, 0.23)',
      accent2: '#4ade80',
      accent2Glow: 'rgba(74, 222, 128, 0.14)',
      accent3: '#166534',
      accent3Glow: 'rgba(22, 101, 52, 0.18)',
      accentRgb: '34, 197, 94',
      accent2Rgb: '74, 222, 128',
      accent3Rgb: '22, 101, 52',
    },
    tailwind: {
      accent: 'green-500',
      accentHover: 'green-600',
      accentLight: 'green-400',
      accentDark: 'green-800',
      accentBorder: 'green-500/30',
      accentBg: 'green-500/10',
      accentText: 'green-400',
    },
  },
  blue: {
    id: 'blue',
    name: 'Signal Blue',
    description: 'A pure blue theme with matching blue icon accents',
    colors: {
      accent: '#3b82f6',
      accentHover: '#2563eb',
      accentGlow: 'rgba(59, 130, 246, 0.25)',
      accent2: '#60a5fa',
      accent2Glow: 'rgba(96, 165, 250, 0.15)',
      accent3: '#1d4ed8',
      accent3Glow: 'rgba(29, 78, 216, 0.18)',
      accentRgb: '59, 130, 246',
      accent2Rgb: '96, 165, 250',
      accent3Rgb: '29, 78, 216',
    },
    tailwind: {
      accent: 'blue-500',
      accentHover: 'blue-600',
      accentLight: 'blue-400',
      accentDark: 'blue-800',
      accentBorder: 'blue-500/30',
      accentBg: 'blue-500/10',
      accentText: 'blue-400',
    },
  },
  indigo: {
    id: 'indigo',
    name: 'Signal Indigo',
    description: 'A deep indigo theme with matching indigo icon accents',
    colors: {
      accent: '#6366f1',
      accentHover: '#4f46e5',
      accentGlow: 'rgba(99, 102, 241, 0.25)',
      accent2: '#818cf8',
      accent2Glow: 'rgba(129, 140, 248, 0.15)',
      accent3: '#3730a3',
      accent3Glow: 'rgba(55, 48, 163, 0.18)',
      accentRgb: '99, 102, 241',
      accent2Rgb: '129, 140, 248',
      accent3Rgb: '55, 48, 163',
    },
    tailwind: {
      accent: 'indigo-500',
      accentHover: 'indigo-600',
      accentLight: 'indigo-400',
      accentDark: 'indigo-800',
      accentBorder: 'indigo-500/30',
      accentBg: 'indigo-500/10',
      accentText: 'indigo-400',
    },
  },
  purple: {
    id: 'purple',
    name: 'Signal Purple',
    description: 'A pure purple theme with matching purple icon accents',
    colors: {
      accent: '#a855f7',
      accentHover: '#9333ea',
      accentGlow: 'rgba(168, 85, 247, 0.26)',
      accent2: '#c084fc',
      accent2Glow: 'rgba(192, 132, 252, 0.15)',
      accent3: '#6b21a8',
      accent3Glow: 'rgba(107, 33, 168, 0.18)',
      accentRgb: '168, 85, 247',
      accent2Rgb: '192, 132, 252',
      accent3Rgb: '107, 33, 168',
    },
    tailwind: {
      accent: 'purple-500',
      accentHover: 'purple-600',
      accentLight: 'purple-400',
      accentDark: 'purple-800',
      accentBorder: 'purple-500/30',
      accentBg: 'purple-500/10',
      accentText: 'purple-400',
    },
  },
};

export const DEFAULT_THEME: ThemeId = 'purple';
export const THEME_ASSET_VERSION = '20260513-logo-depth-v3';

function versionThemeAsset(path: string): string {
  return `${path}?v=${THEME_ASSET_VERSION}`;
}

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

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
  // Themed logos should be named: logo-{themeId}.png
  // Falls back to logo.png if themed version doesn't exist
  return versionThemeAsset(`/logo/logo-${themeId}.png`);
}

/**
 * Get default logo path (for fallback)
 */
export function getDefaultLogoPath(): string {
  return versionThemeAsset('/logo/logo.png');
}

/**
 * Get favicon path for theme
 */
export function getFaviconPath(themeId: ThemeId): string {
  return versionThemeAsset(`/favicon-${themeId}.ico`);
}

/**
 * Get default favicon path (for fallback)
 */
export function getDefaultFaviconPath(): string {
  return versionThemeAsset('/favicon.ico');
}

