import { skeleton, surface } from "@/components/ui/design-system";

function VerificationSkeleton() {
  return (
    <main className="max-w-4xl mx-auto px-4 pb-24 pt-8">
      <div className="mb-6">
        <div className={skeleton("h-9 w-48")} />
        <div className={skeleton("mt-2 h-5 w-96 max-w-full")} />
      </div>

      <div className={surface("panel", "mb-6 p-4")}>
        <div className={skeleton("mb-3 h-5 w-28")} />
        <div className="grid gap-3">
          <div className={skeleton("h-10")} />
          <div className={skeleton("h-10")} />
          <div className={skeleton("h-[100px]")} />
        </div>
        <div className={skeleton("mt-4 h-10 w-36 rounded-xl")} />
      </div>

      <div className={surface("panel", "p-4")}>
        <div className={skeleton("mb-3 h-5 w-28")} />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={surface("empty", "p-3")}>
              <div className="flex items-center justify-between">
                <div className={skeleton("h-4 w-20")} />
                <div className={skeleton("h-3 w-16")} />
              </div>
              <div className={skeleton("mt-2 h-3 w-full")} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function Loading() {
  return <VerificationSkeleton />;
}
