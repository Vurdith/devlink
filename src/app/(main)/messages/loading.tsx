import { skeleton, surface } from "@/components/ui/design-system";

function MessagesSkeleton() {
  return (
    <div className="flex h-full w-full min-w-0">
      <aside className="flex h-full w-full flex-shrink-0 flex-col border-r border-white/[0.06] bg-[rgba(8,11,16,0.92)] md:w-[340px] xl:w-[360px]">
        <div className="flex min-h-[70px] items-center justify-between border-b border-white/[0.06] px-4">
          <div className="space-y-2">
            <div className={skeleton("h-3 w-24 rounded-lg")} />
            <div className={skeleton("h-6 w-32 rounded-lg")} />
          </div>
          <div className={skeleton("h-9 w-9 rounded-lg")} />
        </div>
        <div className="px-4 py-3">
          <div className={skeleton("h-11 rounded-lg")} />
        </div>
        <div className="m-4 mt-0 grid grid-cols-2 gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          <div className={skeleton("h-10 rounded-lg")} />
          <div className={skeleton("h-10 rounded-lg")} />
        </div>
        <div className="space-y-2 p-3 pt-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={surface("empty", "flex min-h-[84px] items-start gap-3 p-3")}>
              <div className={skeleton("h-12 w-12 rounded-full")} />
              <div className="min-w-0 flex-1 space-y-2 py-1">
                <div className="mb-1 flex items-center justify-between">
                  <div className={skeleton("h-4 w-32")} />
                  <div className={skeleton("h-3 w-16")} />
                </div>
                <div className={skeleton("h-3 w-4/5")} />
              </div>
            </div>
          ))}
        </div>
      </aside>
      <section className="hidden min-w-0 flex-1 items-center justify-center p-8 md:flex">
        <div className={surface("panel", "w-full max-w-xl p-6")}>
          <div className={skeleton("mx-auto h-14 w-14 rounded-xl")} />
          <div className={skeleton("mx-auto mt-4 h-6 w-52 rounded-lg")} />
          <div className={skeleton("mx-auto mt-3 h-3 w-full max-w-md rounded-lg")} />
          <div className={skeleton("mx-auto mt-2 h-3 w-4/5 max-w-sm rounded-lg")} />
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <div className={skeleton("h-10 rounded-lg")} />
            <div className={skeleton("h-10 rounded-lg")} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default MessagesSkeleton;
