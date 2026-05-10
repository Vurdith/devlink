import { cn } from "@/lib/cn";
import { surface } from "@/components/ui/design-system";

type ProfileHubSection = "profile" | "skills";

interface ProfileHubTabsProps {
  activeSection: ProfileHubSection;
  onSectionChange: (section: ProfileHubSection) => void;
}

export function ProfileHubTabs({ activeSection, onSectionChange }: ProfileHubTabsProps) {
  const tabs = [
    {
      id: "profile" as const,
      label: "Profile",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "skills" as const,
      label: "Skills & Services",
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={surface(
        "toolbar",
        "noise-overlay relative mb-6 overflow-hidden p-1.5"
      )}
      style={{
        background:
          "linear-gradient(180deg, rgba(13,17,24,0.82), rgba(8,11,16,0.72))",
      }}
    >
      <div
        className="flex max-w-full snap-x gap-1 overflow-x-auto overscroll-x-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {tabs.map((tab) => {
          const selected = activeSection === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              aria-pressed={selected}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "group relative flex flex-shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2.5 text-xs font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.7)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(8,11,16)] sm:px-4 sm:text-sm",
                selected
                  ? "border-[rgba(var(--color-accent-2-rgb),0.30)] bg-[rgba(var(--color-accent-2-rgb),0.11)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "border-transparent text-white/52 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white/86"
              )}
            >
              {selected ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 -bottom-px h-px rounded-full bg-[var(--color-accent-2)]"
                />
              ) : null}
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-md transition-colors [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-4 sm:[&>svg]:w-4",
                  selected
                    ? "bg-[rgba(var(--color-accent-2-rgb),0.12)] text-[var(--color-accent-2)]"
                    : "text-white/45 group-hover:text-white/72"
                )}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
