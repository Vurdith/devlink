"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { iconBox, surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { getAllThemes, ThemeId, ThemeConfig } from "@/lib/themes";
import { useState, useEffect } from "react";
import { SettingsPageHeader } from "../_components/SettingsPageHeader";

function ThemePreview({ theme, isSelected, onSelect }: { 
  theme: ThemeConfig; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  const themeGradient = `linear-gradient(135deg, ${theme.colors.accent3} 0%, ${theme.colors.accent} 54%, ${theme.colors.accent2} 100%)`;

  return (
    <button
      onClick={onSelect}
      style={{
        borderColor: isSelected ? `rgba(${theme.colors.accentRgb}, 0.55)` : undefined,
        background: isSelected
          ? `linear-gradient(180deg, rgba(${theme.colors.accentRgb}, 0.16), rgba(255,255,255,0.035))`
          : undefined,
      }}
      className={cn(
        "noise-overlay group relative w-full overflow-hidden rounded-xl border p-4 text-left outline-none transition-all duration-300 focus-visible:ring-2",
        isSelected
          ? "bg-white/[0.045]"
          : cn(ui.surface.empty, "hover:border-white/[0.14] hover:bg-white/[0.055]")
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: isSelected
            ? `radial-gradient(680px 220px at 28% 0%, rgba(${theme.colors.accentRgb},0.20), transparent 58%)`
            : `radial-gradient(600px 180px at 30% 0%, rgba(${theme.colors.accentRgb},0.09), transparent 62%)`,
        }}
      />
      {isSelected && (
        <div
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: theme.colors.accent }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      <div className="relative mb-4 flex items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.10] bg-black/20"
          style={{ boxShadow: isSelected ? `0 0 0 1px rgba(${theme.colors.accentRgb},0.22) inset` : undefined }}
        >
          <img
            src={`/logo/logo-${theme.id}.png`}
            alt=""
            className="h-11 w-11 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo/logo.png";
            }}
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{theme.name}</h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-white/38">
            {isSelected ? "Active theme" : "Available"}
          </p>
        </div>
      </div>

      <p className="min-h-[2.5rem] text-sm leading-relaxed text-white/60">{theme.description}</p>

      <div className="mt-4 h-2 overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.035]">
        <div 
          className="h-full rounded-full transition-all"
          style={{ 
            background: themeGradient,
            width: isSelected ? '100%' : '60%'
          }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        {[theme.colors.accent3, theme.colors.accent, theme.colors.accent2].map((color) => (
          <span
            key={color}
            className="h-5 flex-1 rounded-md border border-white/[0.08]"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
        ))}
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
      <div className="max-w-4xl animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-96 bg-white/5 rounded mb-8" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="h-48 rounded-xl bg-white/5" />
          <div className="h-48 rounded-xl bg-white/5" />
          <div className="h-48 rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-slide-up">
      <SettingsPageHeader
        eyebrow="Appearance"
        title="Appearance"
        description="Choose a focused accent color. DevLink updates the interface, app icon, and favicon together."
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        }
      />

      {/* Theme Selection */}
      <div className={surface("panel", "noise-overlay relative overflow-hidden p-6")}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(900px 240px at 20% 0%, rgba(var(--color-accent-rgb),0.16), transparent 55%), radial-gradient(800px 240px at 95% 0%, rgba(var(--color-accent-2-rgb),0.12), transparent 60%)",
          }}
        />
        <div className="mb-6 flex items-center gap-3">
          <div className={iconBox("cyan", "h-10 w-10")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Color Theme</h2>
            <p className="text-sm text-white/50">Seven single-color systems, each with its own icon</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        <div className="mt-6 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 p-4">
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--color-accent)] flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div>
              <p className="text-sm text-white/70">
                Your theme is saved on this device. The UI accents, navbar logo, browser favicon, and installed app icon all use the same color family.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Future: More appearance settings */}
      <div className={surface("panelMuted", "noise-overlay relative overflow-hidden p-6 opacity-50")}>
        <div className="flex items-center gap-3">
          <div className={iconBox("muted", "h-10 w-10 rounded-xl")}>
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

