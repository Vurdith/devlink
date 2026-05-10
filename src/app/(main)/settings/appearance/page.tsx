"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { surface, ui } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import { getAllThemes, type ThemeConfig, type ThemeId } from "@/lib/themes";
import { SettingsPageHeader } from "../_components/SettingsPageHeader";

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThemeRailButton({
  theme,
  selected,
  onSelect,
}: {
  theme: ThemeConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  const gradient = `linear-gradient(135deg, ${theme.colors.accent3}, ${theme.colors.accent} 52%, ${theme.colors.accent2})`;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 active:scale-[0.99]",
        selected
          ? "border-[rgba(var(--color-accent-2-rgb),0.36)] bg-[rgba(var(--color-accent-2-rgb),0.09)]"
          : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.15] hover:bg-white/[0.045]"
      )}
      style={{
        boxShadow: selected ? `inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(${theme.colors.accentRgb},0.08)` : undefined,
      }}
    >
      <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-white/[0.10] bg-black/20">
        <span className="absolute inset-0 opacity-80" style={{ background: gradient }} />
        <img
          src={`/logo/logo-${theme.id}.png`}
          alt=""
          className="relative h-9 w-9 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]"
          onError={(event) => {
            event.currentTarget.src = "/logo/logo.png";
          }}
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-white">{theme.name.replace("Signal ", "")}</span>
        <span className="mt-0.5 block text-xs text-white/45">{theme.colors.accent}</span>
      </span>
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
          selected ? "border-white/15 text-white" : "border-white/[0.08] text-transparent group-hover:border-white/[0.14]"
        )}
        style={selected ? { backgroundColor: theme.colors.accent } : undefined}
      >
        <CheckIcon />
      </span>
    </button>
  );
}

function SwatchStack({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        ["Deep", theme.colors.accent3],
        ["Core", theme.colors.accent],
        ["Light", theme.colors.accent2],
      ].map(([label, color]) => (
        <div key={label} className="min-w-0 rounded-lg border border-white/[0.08] bg-white/[0.025] p-2">
          <div className="h-9 rounded-md border border-white/[0.10]" style={{ backgroundColor: color }} />
          <div className="mt-2 truncate text-[11px] font-medium text-white/45">{label}</div>
          <div className="truncate text-xs font-semibold text-white/78">{color}</div>
        </div>
      ))}
    </div>
  );
}

function InterfaceSample({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(8,11,16,0.72)] p-4">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${theme.colors.accent2Rgb},0.55), transparent)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(520px 150px at 18% 0%, rgba(${theme.colors.accentRgb},0.14), transparent 62%)`,
        }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border border-white/[0.10] bg-black/20 p-1.5">
            <img src={`/logo/logo-${theme.id}.png`} alt="" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Profile card</div>
            <div className="text-xs text-white/42">How this theme feels in the app</div>
          </div>
        </div>
        <div
          className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-white"
          style={{
            borderColor: `rgba(${theme.colors.accent2Rgb},0.28)`,
            background: `linear-gradient(135deg, rgba(${theme.colors.accentRgb},0.70), rgba(${theme.colors.accent2Rgb},0.86))`,
          }}
        >
          Save changes
        </div>
      </div>
      <div className="relative mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-sm text-white/55">Write a profile headline</div>
        <div
          className="rounded-lg border px-3 py-2 text-sm font-medium"
          style={{
            color: theme.colors.accent2,
            borderColor: `rgba(${theme.colors.accent2Rgb},0.24)`,
            backgroundColor: `rgba(${theme.colors.accent2Rgb},0.08)`,
          }}
        >
          Available
        </div>
      </div>
    </div>
  );
}

export default function AppearanceSettingsPage() {
  const { themeId, setTheme } = useTheme();
  const themes = useMemo(() => getAllThemes(), []);
  const selectedTheme = useMemo(() => themes.find((theme) => theme.id === themeId) ?? themes[0], [themes, themeId]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-5xl animate-pulse space-y-5">
        <div className="h-28 rounded-xl bg-white/[0.05]" />
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="h-96 rounded-xl bg-white/[0.04]" />
          <div className="h-96 rounded-xl bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-5 animate-slide-up">
      <SettingsPageHeader
        eyebrow="Theme"
        title="Appearance"
        description="Pick the color system DevLink uses for surfaces, controls, the logo, and browser icon."
        icon={<SunIcon />}
      />

      <div className="grid gap-5">
        <section className={surface("panel", "noise-overlay relative overflow-hidden p-5 sm:p-6")}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-75"
            style={{
              background: `radial-gradient(900px 260px at 18% 0%, rgba(${selectedTheme.colors.accentRgb},0.18), transparent 58%), radial-gradient(680px 240px at 92% 0%, rgba(${selectedTheme.colors.accent2Rgb},0.10), transparent 64%)`,
            }}
          />
          <div className="relative grid gap-6 xl:grid-cols-[220px_1fr] xl:items-center">
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-white/[0.08] bg-black/20 p-8">
              <img
                src={`/logo/logo-${selectedTheme.id}.png`}
                alt={`${selectedTheme.name} DevLink icon`}
                className="max-h-44 w-full object-contain drop-shadow-[0_24px_45px_rgba(0,0,0,0.46)]"
              />
            </div>
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
                  style={{
                    color: selectedTheme.colors.accent2,
                    borderColor: `rgba(${selectedTheme.colors.accent2Rgb},0.28)`,
                    backgroundColor: `rgba(${selectedTheme.colors.accent2Rgb},0.08)`,
                  }}
                >
                  Active
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">Current theme</span>
              </div>
              <h2 className="font-[var(--font-space-grotesk)] text-3xl font-bold tracking-normal text-white sm:text-4xl">
                {selectedTheme.name}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">{selectedTheme.description}</p>
              <div className="mt-6">
                <SwatchStack theme={selectedTheme} />
              </div>
            </div>
          </div>
        </section>

        <aside className={surface("panel", "noise-overlay relative overflow-hidden p-4")}>
          <div className="mb-4 flex items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-sm font-semibold text-white">Themes</h2>
              <p className="mt-1 text-xs text-white/42">Logo, buttons, tabs, and highlights update together.</p>
            </div>
            <span className={cn("rounded-lg px-2 py-1 text-[11px] font-semibold text-white/60", ui.surface.empty)}>
              {themes.length}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {themes.map((theme) => (
              <ThemeRailButton
                key={theme.id}
                theme={theme}
                selected={themeId === theme.id}
                onSelect={() => setTheme(theme.id as ThemeId)}
              />
            ))}
          </div>
        </aside>
      </div>

      <section className={surface("panelMuted", "noise-overlay relative overflow-hidden p-5 sm:p-6")}>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">In the interface</h2>
            <p className="mt-1 text-sm text-white/45">A quick check for buttons, fields, panels, and active states.</p>
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-white/30">{selectedTheme.id}</span>
        </div>
        <InterfaceSample theme={selectedTheme} />
      </section>
    </div>
  );
}
