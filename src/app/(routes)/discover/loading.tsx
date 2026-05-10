import { skeleton, surface } from "@/components/ui/design-system";

function DiscoverSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className={surface("panel", "relative overflow-hidden p-4 sm:p-6")}>
        <div className={skeleton("mb-3 h-4 w-28")} />
        <div className={skeleton("mb-3 h-8 w-72 max-w-full")} />
        <div className={skeleton("h-5 w-[34rem] max-w-full")} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[236px_1fr]">
        <div className={surface("toolbar", "flex gap-2 overflow-x-auto p-2 lg:flex-col lg:overflow-visible")}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={skeleton("h-11 w-32 flex-shrink-0 rounded-lg lg:w-full")} />
          ))}
        </div>
        <div className="min-w-0 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={surface("panelMuted", "animate-pulse overflow-hidden")}>
                <div className={skeleton("h-20 w-full rounded-none border-x-0 border-t-0 sm:h-24")} />
                <div className="p-4">
                  <div className="flex items-end gap-3">
                    <div className={skeleton("-mt-8 h-16 w-16 rounded-full ring-4 ring-[rgba(8,11,16,0.92)]")} />
                    <div className="min-w-0 flex-1">
                      <div className={skeleton("mb-2 h-4 w-28")} />
                      <div className={skeleton("h-3 w-20")} />
                    </div>
                  </div>
                  <div className={skeleton("mt-4 h-3 w-full")} />
                  <div className={skeleton("mt-2 h-3 w-4/5")} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={surface("panelMuted", "animate-pulse p-4")}>
                <div className="flex items-center gap-3">
                  <div className={skeleton("h-12 w-12 rounded-full")} />
                  <div className="min-w-0 flex-1">
                    <div className={skeleton("mb-2 h-4 w-36")} />
                    <div className={skeleton("h-3 w-24")} />
                  </div>
                  <div className={skeleton("hidden h-8 w-20 rounded-lg sm:block")} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscoverSkeleton;
