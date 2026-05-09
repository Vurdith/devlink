import { FeedSkeleton } from "@/components/ui/LoadingSpinner";
import { skeleton, surface } from "@/components/ui/design-system";

export default function HomeLoading() {
  return (
    <div className="min-h-screen pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Create post skeleton */}
            <div className={surface("panel", "p-6")}>
              <div className="flex gap-4">
                <div className={skeleton("h-12 w-12 rounded-full")} />
                <div className="flex-1 space-y-3">
                  <div className={skeleton("h-4 w-1/3")} />
                  <div className={skeleton("h-20")} />
                </div>
              </div>
            </div>
            
            {/* Feed skeleton */}
            <FeedSkeleton />
          </div>
          
          {/* Sidebar skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className={surface("panel", "p-6")}>
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










