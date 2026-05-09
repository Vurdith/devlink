import { skeleton, surface } from "@/components/ui/design-system";

function NotificationsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="mb-6">
        <div className={skeleton("h-8 w-40")} />
      </div>

      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={surface("panelMuted", "p-4")}>
          <div className="flex items-start gap-3">
            <div className={skeleton("h-10 w-10 rounded-full")} />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <div className={skeleton("h-4 w-24")} />
                <div className={skeleton("h-3 w-16")} />
              </div>
              <div className={skeleton("h-4 w-full")} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationsSkeleton;
