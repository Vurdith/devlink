"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { getAllThemes, ThemeId, ThemeConfig } from "@/lib/themes";
import { useState, useEffect } from "react";

function ThemePreview({ theme, isSelected, onSelect }: { 
  theme: ThemeConfig; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative group w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden noise-overlay ${
        isSelected 
          ? 'border-[var(--color-accent)] bg-[rgba(var(--color-accent-rgb),0.10)] shadow-lg shadow-[var(--color-accent)]/20'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: isSelected
            ? "radial-gradient(700px 200px at 30% 0%, rgba(var(--color-accent-rgb),0.22), transparent 58%), radial-gradient(600px 200px at 90% 0%, rgba(var(--color-accent-2-rgb),0.16), transparent 62%)"
            : "radial-gradient(700px 200px at 30% 0%, rgba(255,255,255,0.05), transparent 60%)",
        }}
      />
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Theme color preview circles */}
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="w-8 h-8 rounded-full shadow-lg" 
          style={{ backgroundColor: theme.colors.accent }}
        />
        <div 
          className="w-6 h-6 rounded-full shadow-md" 
          style={{ backgroundColor: theme.colors.accent2 }}
        />
        <div 
          className="w-5 h-5 rounded-full shadow-sm" 
          style={{ backgroundColor: theme.colors.accent3 }}
        />
      </div>

      {/* Theme name and description */}
      <h3 className="text-lg font-semibold text-white mb-1">{theme.name}</h3>
      <p className="text-sm text-white/60">{theme.description}</p>

      {/* Preview bar */}
      <div className="mt-4 h-2 rounded-full overflow-hidden bg-black/30">
        <div 
          className="h-full rounded-full transition-all"
          style={{ 
            background: `linear-gradient(90deg, ${theme.colors.accent} 0%, ${theme.colors.accent2} 50%, ${theme.colors.accent3} 100%)`,
            width: isSelected ? '100%' : '60%'
          }}
        />
      </div>

      {/* Logo preview */}
      <div className="mt-4 flex items-center gap-3">
        <img 
          src={`/logo/logo-${theme.id}.png`} 
          alt={`${theme.name} Logo`}
          className="w-10 h-10 object-contain"
          onError={(e) => {
            // Fallback to default logo if themed logo doesn't exist
            (e.target as HTMLImageElement).src = '/logo/logo.png';
          }}
        />
        <span className="text-xs text-white/40">Logo preview</span>
      </div>
    </button>
  );
}

export default function AppearanceSettingsPage() {
  const { themeId, setTheme } = useTheme();
  const themes = getAllThemes();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-2xl animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-96 bg-white/5 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-48 bg-white/5 rounded-2xl" />
          <div className="h-48 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Appearance</h1>
        <p className="text-white/60">
          Customize how DevLink looks for you. Choose a color theme that matches your style.
        </p>
      </div>

      {/* Theme Selection */}
      <div className="relative overflow-hidden glass glass-hover rounded-2xl p-6 border border-white/10 noise-overlay">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(900px 240px at 20% 0%, rgba(var(--color-accent-rgb),0.16), transparent 55%), radial-gradient(800px 240px at 95% 0%, rgba(var(--color-accent-2-rgb),0.12), transparent 60%)",
          }}
        />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)] flex items-center justify-center shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Color Theme</h2>
            <p className="text-sm text-white/50">Select your preferred accent color</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((theme) => (
            <ThemePreview
              key={theme.id}
              theme={theme}
              isSelected={themeId === theme.id}
              onSelect={() => setTheme(theme.id as ThemeId)}
            />
          ))}
        </div>

        {/* Info note */}
        <div className="mt-6 p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent)] flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-sm text-white/70">
                Your theme preference is saved locally and will be remembered when you return.
                The logo and favicon will also update to match your selected theme.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Future: More appearance settings */}
      <div className="mt-6 relative overflow-hidden glass rounded-2xl p-6 border border-white/10 opacity-50 noise-overlay">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/50">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white/50">Layout Settings</h2>
            <p className="text-sm text-white/30">Coming soon - customize your feed layout</p>
          </div>
        </div>
      </div>
    </div>
  );
}

