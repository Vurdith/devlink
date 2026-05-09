import { skeleton, surface } from "@/components/ui/design-system";

function NotificationsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-8">
      <div className={surface("panelStrong", "noise-overlay relative overflow-hidden p-4 sm:p-5")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={skeleton("h-10 w-10 rounded-lg")} />
            <div>
              <div className={skeleton("h-6 w-40")} />
              <div className={skeleton("mt-2 h-4 w-28")} />
            </div>
          </div>
          <div className={skeleton("h-9 w-full rounded-lg sm:w-32")} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-1 sm:w-64">
          <div className={skeleton("h-8 rounded-lg")} />
          <div className={skeleton("h-8 rounded-lg")} />
        </div>
      </div>

      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={surface("panelMuted", "p-4 sm:p-5")}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={skeleton("h-10 w-10 shrink-0 rounded-full")} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className={skeleton("h-4 w-44 max-w-full")} />
                <div className={skeleton("h-3 w-20")} />
              </div>
              <div className={skeleton("mt-3 h-3 w-full")} />
              <div className={skeleton("mt-2 h-3 w-4/5")} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default NotificationsSkeleton;
