import { FeedSkeleton } from "@/components/ui/LoadingSpinner";

export default function HomeLoading() {
  return (
    <div className="min-h-screen pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Create post skeleton */}
            <div className="glass rounded-2xl p-6 border border-white/10 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-20 bg-white/10 rounded" />
                </div>
              </div>
            </div>
            
            {/* Feed skeleton */}
            <FeedSkeleton />
          </div>
          
          {/* Sidebar skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/10 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







