import { FeedSkeleton } from "@/components/ui/LoadingSpinner";
import { skeleton, surface } from "@/components/ui/design-system";

export default function HomeLoading() {
  return (
    <div className="min-h-[100dvh] pt-4 sm:pt-8 lg:pt-12">
      <div className="mx-auto w-full max-w-7xl px-0 sm:px-6 lg:px-8">
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-8">
          {/* Main content */}
          <div className="min-w-0 space-y-5 lg:col-span-8 lg:space-y-6">
            {/* Create post skeleton */}
            <div className={surface("panel", "noise-overlay relative overflow-hidden p-4 sm:p-6")}>
              <div className="flex min-w-0 gap-3 sm:gap-4">
                <div className={skeleton("h-10 w-10 shrink-0 rounded-full sm:h-12 sm:w-12")} />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className={skeleton("h-4 w-1/3")} />
                  <div className={skeleton("h-20")} />
                </div>
              </div>
            </div>
            
            {/* Feed skeleton */}
            <FeedSkeleton />
          </div>
          
          {/* Sidebar skeleton */}
          <div className="min-w-0 space-y-5 lg:col-span-4 lg:space-y-6">
            <div className={surface("panel", "noise-overlay relative overflow-hidden p-4 sm:p-6")}>
              <div className={skeleton("mb-4 h-6 w-1/2")} />
              <div className="space-y-3">
                <div className={skeleton("h-4")} />
                <div className={skeleton("h-4 w-3/4")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}










