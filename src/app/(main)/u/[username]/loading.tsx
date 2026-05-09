import { skeleton, surface } from "@/components/ui/design-system";

export default function ProfileLoading() {
  return (
    <main className="mx-auto max-w-5xl px-2 sm:px-4 py-4 sm:py-10">
      <section className="relative overflow-hidden rounded-xl">
        {/* Banner skeleton */}
        <div className={skeleton("h-36 w-full rounded-none border-0 sm:h-64")} />
        
        {/* Profile card skeleton */}
        <div className={surface("panelStrong", "noise-overlay relative overflow-hidden rounded-t-none border-t-0 px-4 pb-4 sm:px-8 sm:pb-8")}>
          {/* Avatar */}
          <div className="flex items-start justify-between">
            <div className="relative -mt-12 sm:-mt-16 z-20">
              <div className={skeleton("h-20 w-20 rounded-full border-4 border-[var(--background)] sm:h-28 sm:w-28")} />
            </div>
            {/* Follow button placeholder */}
            <div className={skeleton("mt-3 h-9 w-24")} />
          </div>
          
          {/* Name & username */}
          <div className="mt-3 space-y-2">
            <div className={skeleton("h-6 w-48 sm:h-8")} />
            <div className={skeleton("h-4 w-24")} />
          </div>
          
          {/* Profile type badge */}
          <div className="mt-2">
            <div className={skeleton("h-6 w-20 rounded-full")} />
          </div>
          
          {/* Stats row */}
          <div className="mt-3 flex gap-2">
            <div className={skeleton("h-7 w-24 rounded-full")} />
            <div className={skeleton("h-7 w-24 rounded-full")} />
          </div>
          
          {/* Bio */}
          <div className="mt-4 space-y-2">
            <div className={skeleton("h-4 w-full")} />
            <div className={skeleton("h-4 w-3/4")} />
          </div>
        </div>
      </section>
      
      {/* Tabs skeleton */}
      <div className="mt-4 sm:mt-8">
        <div className={surface("toolbar", "mb-6 flex gap-2 p-1.5")}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={skeleton("h-9 w-20")} />
          ))}
        </div>
        
        {/* Posts skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={surface("panel", "relative overflow-hidden p-4")}>
              <div className="flex items-start gap-3">
                <div className={skeleton("h-10 w-10 rounded-full")} />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className={skeleton("h-4 w-24")} />
                    <div className={skeleton("h-4 w-16")} />
                  </div>
                  <div className={skeleton("h-4 w-full")} />
                  <div className={skeleton("h-4 w-3/4")} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}



