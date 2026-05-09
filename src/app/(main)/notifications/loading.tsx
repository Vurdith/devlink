import { surface } from "@/components/ui/design-system";

function NotificationsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="mb-6">
        <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
      </div>

      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={surface("panelMuted", "p-4")}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationsSkeleton;
