import { surface } from "@/components/ui/design-system";

function DiscoverSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className={surface("panel", "relative overflow-hidden p-4 sm:p-6")}>
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-3" />
        <div className="h-5 w-96 max-w-full bg-white/10 rounded animate-pulse" />
      </div>
      <div className={surface("toolbar", "relative flex gap-2 overflow-x-auto p-2 pb-2")}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-28 bg-white/10 rounded-xl animate-pulse flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={surface("panelMuted", "relative overflow-hidden animate-pulse")}>
            <div className="h-24 sm:h-28 w-full bg-white/5" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-white/10 border-4 border-[var(--background)]" />
                  <div className="min-w-0">
                    <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-24 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="h-8 w-20 bg-white/10 rounded-xl" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-6 w-24 bg-white/10 rounded-lg" />
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full bg-white/10 rounded" />
                <div className="h-3 w-4/5 bg-white/10 rounded" />
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-4">
                <div className="h-3 w-28 bg-white/10 rounded" />
                <div className="h-3 w-28 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DiscoverSkeleton;
