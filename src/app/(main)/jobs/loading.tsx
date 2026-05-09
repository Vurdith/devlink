import { surface } from "@/components/ui/design-system";

function JobsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
        <div className="h-10 w-32 bg-white/10 rounded-xl animate-pulse" />
      </div>

      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={surface("panelMuted", "p-5")}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-5 w-64 bg-white/10 rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-white/10 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-6 w-24 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-6 w-24 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobsSkeleton;
