import { surface } from "@/components/ui/design-system";

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-96 max-w-full bg-white/10 rounded animate-pulse mt-2" />
      </div>

      {[1, 2, 3].map((i) => (
        <div key={i} className={surface("panel", "relative overflow-hidden p-6")}>
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
            <div className="min-w-0">
              <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-64 bg-white/10 rounded animate-pulse mt-1" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-11 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-11 bg-white/5 rounded-xl animate-pulse" />
            <div className="h-11 w-32 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SettingsSkeleton;
