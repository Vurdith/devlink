import type { CSSProperties, ReactNode } from "react";
import { iconBox, surface } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";

type SettingsSectionTone = "cyan" | "muted" | "danger";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  tone?: SettingsSectionTone;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
}

const toneGlow: Record<SettingsSectionTone, string> = {
  cyan:
    "radial-gradient(900px 240px at 15% 0%, rgba(var(--color-accent-rgb),0.14), transparent 58%), radial-gradient(740px 220px at 94% 0%, rgba(var(--color-accent-2-rgb),0.10), transparent 64%)",
  muted:
    "radial-gradient(760px 220px at 20% 0%, rgba(255,255,255,0.055), transparent 62%)",
  danger:
    "radial-gradient(860px 240px at 15% 0%, rgba(239,68,68,0.13), transparent 58%), radial-gradient(740px 220px at 94% 0%, rgba(244,63,94,0.09), transparent 64%)",
};

export function SettingsSection({
  title,
  description,
  icon,
  tone = "cyan",
  children,
  aside,
  className,
  contentClassName,
  style,
}: SettingsSectionProps) {
  return (
    <section
      className={surface(
        tone === "danger" ? "panel" : "panelMuted",
        cn(
          "noise-overlay relative overflow-hidden p-4 sm:p-6",
          tone === "danger" && "border-red-500/25",
          className
        )
      )}
      style={style}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: toneGlow[tone] }}
      />
      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {icon ? (
              <div className={iconBox(tone === "danger" ? "danger" : tone === "muted" ? "muted" : "cyan", "h-10 w-10 shrink-0")}>
                {icon}
              </div>
            ) : null}
            <div className="min-w-0">
              <h2 className="font-[var(--font-space-grotesk)] text-lg font-semibold tracking-normal text-white">
                {title}
              </h2>
              {description ? (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
              ) : null}
            </div>
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
        <div className={cn("relative", contentClassName)}>{children}</div>
      </div>
    </section>
  );
}
