import { surface } from "@/components/ui/design-system";

export default function VerifyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className={surface("panel", "p-6")}>
        <h1 className="text-2xl font-semibold mb-2">Get Verified</h1>
        <p className="text-[var(--muted-foreground)]">
          Verification boosts trust and visibility across DevLink. We’ll add payment and submission here.
        </p>
      </div>
    </main>
  );
}


