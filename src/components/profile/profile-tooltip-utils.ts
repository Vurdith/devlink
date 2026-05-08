export const PROFILE_GRADIENTS: Record<string, string> = {
  DEVELOPER: "from-blue-500/20 via-blue-400/10 to-cyan-500/20",
  CLIENT: "from-emerald-500/20 via-green-400/10 to-teal-500/20",
  STUDIO: "from-purple-500/20 via-fuchsia-400/10 to-indigo-500/20",
  INFLUENCER: "from-rose-500/20 via-pink-400/10 to-[var(--color-accent)]/20",
  INVESTOR: "from-amber-500/20 via-yellow-400/10 to-orange-500/20",
  DEFAULT: "from-slate-500/20 via-gray-400/10 to-zinc-500/20",
};

export const PROFILE_BORDERS: Record<string, string> = {
  DEVELOPER: "border-blue-500/40 shadow-blue-500/20",
  CLIENT: "border-emerald-500/40 shadow-emerald-500/20",
  STUDIO: "border-purple-500/40 shadow-purple-500/20",
  INFLUENCER: "border-rose-500/40 shadow-rose-500/20",
  INVESTOR: "border-amber-500/40 shadow-amber-500/20",
  DEFAULT: "border-white/20 shadow-white/10",
};

export const BADGE_CLASSES: Record<string, string> = {
  DEVELOPER: "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-blue-500/20",
  CLIENT: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/20",
  STUDIO: "bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-purple-500/20",
  INFLUENCER: "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-rose-500/20",
  INVESTOR: "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/20",
  DEFAULT: "bg-slate-500/15 text-slate-300 border-slate-500/30 shadow-slate-500/20",
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
