import type { TabType } from "./profile-types";

export function ProfileTabLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative overflow-hidden glass-soft rounded-xl border border-white/10 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-4 w-16 bg-white/5 rounded" />
              </div>
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-3/4 bg-white/10 rounded" />
              <div className="flex gap-4 mt-3">
                <div className="h-4 w-12 bg-white/5 rounded" />
                <div className="h-4 w-12 bg-white/5 rounded" />
                <div className="h-4 w-12 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileTabError({ activeTab, error }: { activeTab: TabType; error: string }) {
  return (
    <div className="rounded-lg bg-[rgba(var(--color-accent-rgb),0.1)] border border-[rgba(var(--color-accent-rgb),0.2)] p-4 mb-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-[var(--color-accent)] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <h3 className="font-medium text-[var(--color-accent)]">Failed to load {activeTab}</h3>
          <p className="text-sm text-[var(--color-accent)]/80 mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
}
