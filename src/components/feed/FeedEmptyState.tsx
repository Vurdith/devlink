import { Search, SquarePen, Users } from "lucide-react";
import { ActionLink } from "@/components/ui/ActionLink";
import { surface } from "@/components/ui/design-system";

const firstActions = [
  "Post a build note",
  "Ask for a collaborator",
  "Reply to someone active",
];

export function FeedEmptyState() {
  return (
    <div className={surface("panelMuted", "noise-overlay overflow-hidden p-4 sm:p-5")}>
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-normal text-white">Nothing here yet</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/56">
            Follow a few builders, studios, or clients and their posts will land here.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:w-44">
          <ActionLink href="/discover" variant="primary" size="md" leftIcon={<Users className="h-4 w-4" />}>
            Find people
          </ActionLink>
          <ActionLink href="/search" variant="secondary" size="md" leftIcon={<Search className="h-4 w-4" />}>
            Search posts
          </ActionLink>
        </div>
      </div>
      <div className="mt-5 grid gap-2 border-t border-white/[0.06] pt-4 sm:grid-cols-3">
        {firstActions.map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-sm text-white/62">
            <SquarePen className="h-4 w-4 text-[var(--color-accent-2)]" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
