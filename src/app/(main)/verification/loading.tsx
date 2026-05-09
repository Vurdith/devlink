import { surface } from "@/components/ui/design-system";

function VerificationSkeleton() {
  return (
    <main className="max-w-4xl mx-auto px-4 pb-24 pt-8">
      <div className="mb-6">
        <div className="h-9 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-5 w-96 max-w-full bg-white/10 rounded animate-pulse mt-2" />
      </div>

      <div className={surface("panel", "mb-6 p-4")}>
        <div className="h-5 w-28 bg-white/10 rounded animate-pulse mb-3" />
        <div className="grid gap-3">
          <div className="h-10 animate-pulse rounded-lg border border-white/[0.08] bg-white/[0.035]" />
          <div className="h-10 animate-pulse rounded-lg border border-white/[0.08] bg-white/[0.035]" />
          <div className="h-[100px] animate-pulse rounded-lg border border-white/[0.08] bg-white/[0.035]" />
        </div>
        <div className="h-10 w-36 bg-white/10 rounded-xl animate-pulse mt-4" />
      </div>

      <div className={surface("panel", "p-4")}>
        <div className="h-5 w-28 bg-white/10 rounded animate-pulse mb-3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-white/10 p-3 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              </div>
              <div className="h-3 w-full bg-white/10 rounded animate-pulse mt-2" />
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
