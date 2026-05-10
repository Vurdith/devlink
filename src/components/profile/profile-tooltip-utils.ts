export const PROFILE_GRADIENTS: Record<string, string> = {
  DEVELOPER: "from-[rgba(var(--color-accent-rgb),0.18)] via-[rgba(var(--color-accent-2-rgb),0.10)] to-[rgba(var(--color-accent-3-rgb),0.18)]",
  CLIENT: "from-[rgba(var(--color-accent-rgb),0.18)] via-[rgba(var(--color-accent-2-rgb),0.10)] to-[rgba(var(--color-accent-3-rgb),0.18)]",
  STUDIO: "from-[rgba(var(--color-accent-rgb),0.18)] via-[rgba(var(--color-accent-2-rgb),0.10)] to-[rgba(var(--color-accent-3-rgb),0.18)]",
  INFLUENCER: "from-[rgba(var(--color-accent-rgb),0.18)] via-[rgba(var(--color-accent-2-rgb),0.10)] to-[rgba(var(--color-accent-3-rgb),0.18)]",
  INVESTOR: "from-[rgba(var(--color-accent-rgb),0.18)] via-[rgba(var(--color-accent-2-rgb),0.10)] to-[rgba(var(--color-accent-3-rgb),0.18)]",
  DEFAULT: "from-slate-500/20 via-gray-400/10 to-zinc-500/20",
};

export const PROFILE_BORDERS: Record<string, string> = {
  DEVELOPER: "border-[rgba(var(--color-accent-2-rgb),0.40)]",
  CLIENT: "border-[rgba(var(--color-accent-2-rgb),0.40)]",
  STUDIO: "border-[rgba(var(--color-accent-2-rgb),0.40)]",
  INFLUENCER: "border-[rgba(var(--color-accent-2-rgb),0.40)]",
  INVESTOR: "border-[rgba(var(--color-accent-2-rgb),0.40)]",
  DEFAULT: "border-white/20",
};

export const BADGE_CLASSES: Record<string, string> = {
  DEVELOPER: "bg-[rgba(var(--color-accent-2-rgb),0.12)] text-[var(--color-accent-2)] border-[rgba(var(--color-accent-2-rgb),0.28)]",
  CLIENT: "bg-[rgba(var(--color-accent-2-rgb),0.12)] text-[var(--color-accent-2)] border-[rgba(var(--color-accent-2-rgb),0.28)]",
  STUDIO: "bg-[rgba(var(--color-accent-2-rgb),0.12)] text-[var(--color-accent-2)] border-[rgba(var(--color-accent-2-rgb),0.28)]",
  INFLUENCER: "bg-[rgba(var(--color-accent-2-rgb),0.12)] text-[var(--color-accent-2)] border-[rgba(var(--color-accent-2-rgb),0.28)]",
  INVESTOR: "bg-[rgba(var(--color-accent-2-rgb),0.12)] text-[var(--color-accent-2)] border-[rgba(var(--color-accent-2-rgb),0.28)]",
  DEFAULT: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

export function getProfileGradient(profileType?: string | null) {
  return PROFILE_GRADIENTS[profileType || "DEFAULT"] || PROFILE_GRADIENTS.DEFAULT;
}

export function getProfileBorder(profileType?: string | null) {
  return PROFILE_BORDERS[profileType || "DEFAULT"] || PROFILE_BORDERS.DEFAULT;
}

export function getProfileBadgeClasses(profileType?: string | null) {
  return BADGE_CLASSES[profileType || "DEFAULT"] || BADGE_CLASSES.DEFAULT;
}

export function formatProfileCount(count: number | undefined | null) {
  if (count == null) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
