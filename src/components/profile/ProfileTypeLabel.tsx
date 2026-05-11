import { cn } from "@/lib/cn";
import { getProfileTypeConfig, ProfileTypeIcon } from "@/types/profile";

type ProfileTypeLabelVariant = "hero" | "inline" | "compact";

interface ProfileTypeLabelProps {
  profileType: string;
  variant?: ProfileTypeLabelVariant;
  className?: string;
}

const variantClasses: Record<ProfileTypeLabelVariant, string> = {
  hero: "rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]",
  inline: "rounded-md px-2.5 py-1 text-xs",
  compact: "rounded px-2 py-0.5 text-[11px]",
};

const iconSizes: Record<ProfileTypeLabelVariant, number> = {
  hero: 11,
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
        "inline-flex max-w-full flex-shrink-0 items-center gap-1.5 whitespace-nowrap border border-current/25 font-semibold",
        config.bgColor,
        config.color,
        variantClasses[variant],
        className
      )}
    >
      <span
        className={cn(
          "inline-flex flex-shrink-0 items-center justify-center rounded-full bg-current/10",
          variant === "hero" ? "h-4 w-4" : "h-3.5 w-3.5"
        )}
        aria-hidden="true"
      >
        <ProfileTypeIcon
          profileType={profileType}
          size={iconSizes[variant]}
          className={cn("opacity-95", config.color)}
        />
      </span>
      <span className="truncate">{config.label}</span>
    </span>
  );
}
