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
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
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
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white placeholder:text-white/40 outline-none focus:border-white/40"
              placeholder="Enter password"
            />
          </label>

          {hasError ? (
            <p className="text-sm text-red-300">Incorrect password. Please try again.</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-white text-black font-medium py-2.5 hover:bg-white/90 transition-colors"
          >
            Unlock site
          </button>
        </form>
      </div>
    </main>
  );
}
