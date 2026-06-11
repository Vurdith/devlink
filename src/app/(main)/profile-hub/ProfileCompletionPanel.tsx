import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { ActionLink } from "@/components/ui/ActionLink";
import { surface } from "@/components/ui/design-system";
import { cn } from "@/lib/cn";
import type { ProfileData } from "./ProfileSection";
import type { UserSkill } from "./profile-hub-types";

type ProfileHubSection = "profile" | "skills";

interface CompletionTask {
  label: string;
  description: string;
  done: boolean;
  section: ProfileHubSection;
}

interface ProfileCompletionPanelProps {
  name: string;
  profile: ProfileData;
  userSkills: UserSkill[];
  activeSection: ProfileHubSection;
  onSectionChange: (section: ProfileHubSection) => void;
}

export function ProfileCompletionPanel({
  name,
  profile,
  userSkills,
  activeSection,
  onSectionChange,
}: ProfileCompletionPanelProps) {
  const tasks: CompletionTask[] = [
    {
      label: "Add your name",
      description: "Make search, messages, and profile previews easier to trust.",
      done: Boolean(name.trim()),
      section: "profile",
    },
    {
      label: "Write a useful bio",
      description: "Say what you build, who you help, and what you want to be contacted for.",
      done: profile.bio.trim().length >= 40,
      section: "profile",
    },
    {
      label: "Set a headline",
      description: "Give clients and collaborators a fast reason to keep reading.",
      done: profile.headline.trim().length >= 12,
      section: "profile",
    },
    {
      label: "Add three skills",
      description: "Skills power discovery, recommendations, and profile matching.",
      done: userSkills.length >= 3,
      section: "skills",
    },
    {
      label: "Pick a primary skill",
      description: "Your primary skill tells people what you want to be known for first.",
      done: userSkills.some((skill) => skill.isPrimary),
      section: "skills",
    },
    {
      label: "Add a rate or availability",
      description: "Hiring signals make it easier for clients to start the right conversation.",
      done: userSkills.some((skill) => skill.rate || skill.skillAvailability) || Boolean(profile.hourlyRate),
      section: "skills",
    },
  ];

  const completedCount = tasks.filter((task) => task.done).length;
  const completionPercent = Math.round((completedCount / tasks.length) * 100);
  const nextTask = tasks.find((task) => !task.done);
  const isComplete = completedCount === tasks.length;

  return (
    <section className={surface("panelMuted", "noise-overlay relative mb-6 overflow-hidden p-4 sm:p-5")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.36)] to-transparent" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)] lg:items-start">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-normal text-white">Profile strength</h2>
              <p className="mt-1 max-w-xl text-sm leading-5 text-white/52">
                Complete the signals that make your profile easier to find, trust, and contact.
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white/66">
              {completionPercent}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.055]">
            <div
              className="h-full rounded-full bg-[var(--color-accent-2)] transition-[width] duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {isComplete ? (
              <ActionLink href="/me" variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View profile
              </ActionLink>
            ) : nextTask ? (
              <button
                type="button"
                onClick={() => onSectionChange(nextTask.section)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg border border-[rgba(var(--color-accent-2-rgb),0.28)] bg-[rgba(var(--color-accent-2-rgb),0.12)] px-3 text-sm font-semibold text-white transition-colors hover:bg-[rgba(var(--color-accent-2-rgb),0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.55)]",
                  activeSection === nextTask.section && "border-white/[0.14] bg-white/[0.06]"
                )}
              >
                Continue setup
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
            <span className="text-xs font-medium text-white/46">
              {completedCount}/{tasks.length} complete
            </span>
          </div>
        </div>

        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          {tasks.map((task) => {
            const Icon = task.done ? CheckCircle2 : Circle;
            return (
              <button
                key={task.label}
                type="button"
                onClick={() => onSectionChange(task.section)}
                className={cn(
                  "group grid min-h-[88px] grid-cols-[20px_minmax(0,1fr)] gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.45)]",
                  task.done
                    ? "border-emerald-300/14 bg-emerald-400/[0.055]"
                    : "border-white/[0.08] bg-white/[0.025] hover:border-[rgba(var(--color-accent-2-rgb),0.24)] hover:bg-white/[0.045]"
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-4 w-4",
                    task.done ? "text-emerald-300/80" : "text-white/28 group-hover:text-[var(--color-accent-2)]"
                  )}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white/82">{task.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-white/46">{task.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
