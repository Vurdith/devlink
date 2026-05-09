import { skeleton, surface } from "@/components/ui/design-system";

function EscrowSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <div className={skeleton("h-8 w-40")} />
        <div className={skeleton("mt-2 h-5 w-96 max-w-full")} />
      </div>

      {[1, 2].map((i) => (
        <div key={i} className={surface("panelMuted", "p-5")}>
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={skeleton("h-12 w-12 rounded-full")} />
              <div>
                <div className={skeleton("mb-1 h-5 w-32")} />
                <div className={skeleton("h-4 w-24")} />
              </div>
            </div>
            <div className={skeleton("h-6 w-24")} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className={skeleton("h-4 w-20")} />
              <div className={skeleton("h-4 w-28")} />
            </div>
            <div className={skeleton("h-2 w-full overflow-hidden rounded-full")}>
              <div className="h-full w-1/2 rounded-full bg-[rgba(var(--color-accent-2-rgb),0.22)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EscrowSkeleton;
