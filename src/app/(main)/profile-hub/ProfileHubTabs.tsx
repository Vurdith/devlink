import { cn } from "@/lib/cn";

type ProfileHubSection = "profile" | "skills";

interface ProfileHubTabsProps {
  activeSection: ProfileHubSection;
  onSectionChange: (section: ProfileHubSection) => void;
}

export function ProfileHubTabs({ activeSection, onSectionChange }: ProfileHubTabsProps) {
  return (
    <div className="relative overflow-hidden glass-soft rounded-2xl border border-white/10 p-2 flex gap-2 mb-6 overflow-x-auto">
      <button
        onClick={() => onSectionChange("profile")}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg whitespace-nowrap",
          activeSection === "profile"
            ? "text-white bg-[rgba(var(--color-accent-rgb),0.2)] border border-[rgba(var(--color-accent-rgb),0.4)]"
            : "text-[var(--muted-foreground)] hover:text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] border border-transparent"
        )}
      >
        <svg className={cn("w-4 h-4", activeSection === "profile" && "text-[var(--color-accent)]")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Profile
      </button>
      <button
        onClick={() => onSectionChange("skills")}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg whitespace-nowrap",
          activeSection === "skills"
            ? "text-white bg-[rgba(var(--color-accent-rgb),0.2)] border border-[rgba(var(--color-accent-rgb),0.4)]"
            : "text-[var(--muted-foreground)] hover:text-[var(--color-accent)] hover:bg-[rgba(var(--color-accent-rgb),0.1)] border border-transparent"
        )}
      >
        <svg className={cn("w-4 h-4", activeSection === "skills" && "text-[var(--color-accent)]")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
