import { skeleton, surface } from "@/components/ui/design-system";

function MessagesSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className={skeleton("h-8 w-32")} />
      </div>

      <div className={surface("panel", "overflow-hidden")}>
        <div className="border-b border-white/[0.08] p-4">
          <div className={skeleton("h-10 rounded-xl")} />
        </div>

        <div className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className={skeleton("h-12 w-12 rounded-full")} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <div className={skeleton("h-4 w-32")} />
                  <div className={skeleton("h-3 w-16")} />
                </div>
                <div className={skeleton("h-3 w-full")} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MessagesSkeleton;
