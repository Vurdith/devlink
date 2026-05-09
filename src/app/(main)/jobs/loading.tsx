import { skeleton, surface } from "@/components/ui/design-system";

function JobsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className={skeleton("h-8 w-32")} />
        <div className={skeleton("h-10 w-32 rounded-xl")} />
      </div>

      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={surface("panelMuted", "p-5")}>
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <div className={skeleton("mb-2 h-5 w-64")} />
                <div className={skeleton("h-4 w-32")} />
              </div>
              <div className={skeleton("h-6 w-20")} />
            </div>
            <div className="mb-4 space-y-2">
              <div className={skeleton("h-4 w-full")} />
              <div className={skeleton("h-4 w-3/4")} />
            </div>
            <div className="flex items-center gap-4">
              <div className={skeleton("h-6 w-24")} />
              <div className={skeleton("h-6 w-24")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobsSkeleton;
