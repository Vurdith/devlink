import { skeleton, surface } from "@/components/ui/design-system";

export default function PostPageLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      {/* Main post skeleton */}
      <div className="mb-6">
        <div className={surface("panel", "p-6")}>
          {/* Header */}
          <div className="mb-4 flex items-start gap-3">
            <div className={skeleton("h-12 w-12 rounded-full")} />
            <div className="flex-1">
              <div className={skeleton("mb-2 h-4 w-32")} />
              <div className={skeleton("h-3 w-24")} />
            </div>
          </div>
          
          {/* Content */}
          <div className="mb-4 space-y-2">
            <div className={skeleton("h-4 w-full")} />
            <div className={skeleton("h-4 w-4/5")} />
            <div className={skeleton("h-4 w-3/5")} />
          </div>
          
          {/* Media placeholder */}
          <div className={skeleton("mb-4 h-64 w-full rounded-xl")} />
          
          {/* Actions */}
          <div className="flex items-center gap-6 border-t border-white/[0.08] pt-4">
            <div className={skeleton("h-8 w-16")} />
            <div className={skeleton("h-8 w-16")} />
            <div className={skeleton("h-8 w-16")} />
            <div className={skeleton("h-8 w-16")} />
          </div>
        </div>
      </div>
      
      {/* Reply form skeleton */}
      <div className="mb-6">
        <div className={surface("panelMuted", "p-4")}>
          <div className="flex gap-3">
            <div className={skeleton("h-10 w-10 rounded-full")} />
            <div className="flex-1">
              <div className={skeleton("h-20 w-full")} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Replies skeleton */}
      <div className="space-y-4">
        <div className={skeleton("mb-4 h-6 w-32")} />
        {[1, 2, 3].map(i => (
          <div key={i} className={surface("panelMuted", "p-4")}>
            <div className="flex items-start gap-3">
              <div className={skeleton("h-10 w-10 rounded-full")} />
              <div className="flex-1">
                <div className={skeleton("mb-2 h-4 w-24")} />
                <div className={skeleton("mb-1 h-3 w-full")} />
                <div className={skeleton("h-3 w-3/4")} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

