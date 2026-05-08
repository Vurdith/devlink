import { cn } from "@/lib/cn";

type ProfileHubSection = "profile" | "skills";

interface ProfileHubTabsProps {
  activeSection: ProfileHubSection;
  onSectionChange: (section: ProfileHubSection) => void;
}

export function ProfileHubTabs({ activeSection, onSectionChange }: ProfileHubTabsProps) {
  return (
    <div className="mb-6 flex gap-1.5 overflow-x-auto rounded-xl border border-white/[0.08] bg-[rgba(8,11,16,0.78)] p-1.5">
      <button
        onClick={() => onSectionChange("profile")}
        className={cn(
          "flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all",
          activeSection === "profile"
            ? "accent-halo-cyan border-[rgba(var(--color-accent-2-rgb),0.34)] bg-[rgba(var(--color-accent-2-rgb),0.14)] text-white"
            : "border-transparent text-[var(--muted-foreground)] hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-white"
        )}
      >
        <svg className={cn("h-4 w-4", activeSection === "profile" && "text-[var(--color-accent-2)]")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Profile
      </button>
      <button
        onClick={() => onSectionChange("skills")}
        className={cn(
          "flex items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all",
          activeSection === "skills"
            ? "accent-halo-cyan border-[rgba(var(--color-accent-2-rgb),0.34)] bg-[rgba(var(--color-accent-2-rgb),0.14)] text-white"
            : "border-transparent text-[var(--muted-foreground)] hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-white"
        )}
      >
        <svg className={cn("h-4 w-4", activeSection === "skills" && "text-[var(--color-accent-2)]")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Skills & Services
      </button>
    </div>
  );
}
