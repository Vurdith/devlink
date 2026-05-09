import { surface, ui } from "@/components/ui/design-system";

type SiteLockPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function sanitizeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export default async function SiteLockPage({ searchParams }: SiteLockPageProps) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const nextPath = sanitizeNextPath(params.next);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-white">
      <div className={surface("panelStrong", "noise-overlay relative w-full max-w-md overflow-hidden p-6 sm:p-8")}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-accent-2-rgb),0.40)] to-transparent" />
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent-2)]">Private preview</div>
        <h1 className="text-2xl font-semibold tracking-tight">Site access restricted</h1>
        <p className="mt-2 text-sm text-white/70">
          Enter the temporary access password to continue.
        </p>

        <form method="POST" action="/api/site-lock" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />

          <label className="block text-sm">
            <span className="mb-2 block text-white/85">Password</span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-white placeholder:text-white/40 outline-none transition-colors focus:border-[rgba(var(--color-accent-2-rgb),0.55)] focus:bg-white/[0.07]"
              placeholder="Enter password"
            />
          </label>

          {hasError ? (
            <p className="text-sm text-red-300">Incorrect password. Please try again.</p>
          ) : null}

          <button
            type="submit"
            className={`w-full rounded-lg px-4 py-2.5 font-medium ${ui.control.gradient}`}
          >
            Unlock site
          </button>
        </form>
      </div>
    </main>
  );
}
