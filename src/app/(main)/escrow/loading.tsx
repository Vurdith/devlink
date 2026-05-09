import { surface } from "@/components/ui/design-system";

function EscrowSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-96 max-w-full bg-white/10 rounded animate-pulse mt-2" />
      </div>

      {[1, 2].map((i) => (
        <div key={i} className={surface("panelMuted", "p-5")}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
              <div>
                <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-1" />
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-24 bg-white/10 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EscrowSkeleton;
