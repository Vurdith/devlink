import { cn } from "@/lib/cn";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/types/profile";

type ProfileTypeLabelVariant = "hero" | "inline" | "compact";

interface ProfileTypeLabelProps {
  profileType: string;
  variant?: ProfileTypeLabelVariant;
  className?: string;
}

const variantClasses: Record<ProfileTypeLabelVariant, string> = {
  hero: "rounded-lg px-2.5 py-1.5 text-xs",
  inline: "rounded-md px-2.5 py-1 text-xs",
  compact: "rounded px-2 py-0.5 text-[11px]",
};

const iconSizes: Record<ProfileTypeLabelVariant, number> = {
  hero: 12,
  inline: 11,
  compact: 10,
};

export function ProfileTypeLabel({
  profileType,
  variant = "inline",
  className,
}: ProfileTypeLabelProps) {
  const config = getProfileTypeConfig(profileType);

  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-shrink-0 items-center gap-1.5 whitespace-nowrap border border-[rgba(var(--color-accent-2-rgb),0.22)] bg-[rgba(var(--color-accent-2-rgb),0.08)] font-semibold text-[var(--color-accent-2)]",
        variantClasses[variant],
        className
      )}
    >
      <ProfileTypeIcon
        profileType={profileType}
        size={iconSizes[variant]}
        className={cn("opacity-95", config.color)}
      />
      <span className="truncate">{config.label}</span>
    </span>
  );
}
