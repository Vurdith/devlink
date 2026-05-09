import { skeleton, surface } from "@/components/ui/design-system";

function DiscoverSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className={surface("panel", "relative overflow-hidden p-4 sm:p-6")}>
        <div className={skeleton("mb-3 h-8 w-48")} />
        <div className={skeleton("h-5 w-96 max-w-full")} />
      </div>
      <div className={surface("toolbar", "relative flex gap-2 overflow-x-auto p-2 pb-2")}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={skeleton("h-10 w-28 flex-shrink-0 rounded-xl")} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={surface("panelMuted", "relative overflow-hidden animate-pulse")}>
            <div className={skeleton("h-24 w-full rounded-none border-x-0 border-t-0 sm:h-28")} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={skeleton("h-12 w-12 rounded-full border-4 border-[var(--background)]")} />
                  <div className="min-w-0">
                    <div className={skeleton("mb-2 h-4 w-32")} />
                    <div className={skeleton("h-3 w-24")} />
                  </div>
                </div>
                <div className={skeleton("h-8 w-20 rounded-xl")} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className={skeleton("h-6 w-24")} />
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="mt-3 space-y-2">
                <div className={skeleton("h-3 w-full")} />
                <div className={skeleton("h-3 w-4/5")} />
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-white/[0.08] pt-3">
                <div className={skeleton("h-3 w-28")} />
                <div className={skeleton("h-3 w-28")} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DiscoverSkeleton;
