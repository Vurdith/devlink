import Link from "next/link";
import { cn } from "@/lib/cn";
import { surface, ui } from "@/components/ui/design-system";

export default function VerifyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className={surface("panel", "noise-overlay relative overflow-hidden p-5 sm:p-6")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.42)] to-transparent" />
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-2)]">
          Verification
        </p>
        <h1 className="mb-2 text-2xl font-semibold text-white">Request verification</h1>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Ask DevLink to review trust signals like email, identity, or portfolio ownership.
          You can submit a request, track its status, and remove it while it is still pending.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Email", "Confirm the account email connected to your profile."],
            ["ID check", "Ask for a manual identity review before higher-trust work."],
            ["Portfolio proof", "Show that important portfolio links belong to you."],
          ].map(([title, description]) => (
            <div key={title} className={surface("empty", "p-3")}>
              <div className="text-sm font-semibold text-white">{title}</div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/verification"
            className={cn("inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold", ui.control.gradient)}
          >
            Open verification requests
          </Link>
          <Link
            href="/login?callbackUrl=/verification"
            className={cn("inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold", ui.control.ghost)}
          >
            Sign in first
          </Link>
        </div>
      </div>
    </main>
  );
}
