import { FeedSkeleton } from "@/components/ui/LoadingSpinner";
import { skeleton, surface } from "@/components/ui/design-system";

export default function HomeLoading() {
  return (
    <div className="min-h-[100dvh] pt-4 sm:pt-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 gap-5 pb-20 lg:grid-cols-[minmax(0,760px)_minmax(280px,1fr)] lg:items-start lg:gap-8">
          <div className="min-w-0">
            <div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 space-y-3">
                <div className={skeleton("h-3 w-20")} />
                <div className={skeleton("h-8 w-64 max-w-full")} />
                <div className={skeleton("h-4 w-full max-w-lg")} />
              </div>
              <div className={skeleton("h-9 w-28 rounded-lg")} />
            </div>

            <div className={surface("panelMuted", "noise-overlay relative mb-5 overflow-hidden p-4 sm:p-5")}>
              <div className="flex min-w-0 gap-3 sm:gap-4">
                <div className={skeleton("h-11 w-11 shrink-0 rounded-full")} />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className={skeleton("h-4 w-32")} />
                  <div className={skeleton("h-4 w-full max-w-md")} />
                </div>
                <div className={skeleton("h-11 w-11 shrink-0 rounded-lg")} />
              </div>
            </div>
            
            <FeedSkeleton />
          </div>
          
          <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
            <div className={surface("toolbar", "noise-overlay relative overflow-hidden p-4")}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className={skeleton("h-4 w-32")} />
                  <div className={skeleton("h-3 w-20")} />
                </div>
                <div className={skeleton("h-8 w-24 rounded-lg")} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className={skeleton("h-20 rounded-lg")} />
                <div className={skeleton("h-20 rounded-lg")} />
              </div>
            </div>

            <div className={surface("empty", "p-3")}>
              <div className={skeleton("mb-3 h-4 w-36")} />
              <div className="space-y-2">
                <div className={skeleton("h-12 rounded-lg")} />
                <div className={skeleton("h-12 rounded-lg")} />
                <div className={skeleton("h-12 rounded-lg")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}










