// Server Component - No client JS needed
import Link from "next/link";

export function CTASection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative px-4 py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] glass border border-white/10 noise-overlay">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-65"
            style={{
              background:
                "radial-gradient(1100px 320px at 25% 0%, rgba(var(--color-accent-rgb),0.18), transparent 60%), radial-gradient(900px 320px at 92% 5%, rgba(var(--color-accent-2-rgb),0.13), transparent 62%)",
            }}
          />

          <div className="relative p-8 md:p-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
            {/* Left copy */}
            <div>
              <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-space-grotesk)] tracking-tight">
                <span className="text-white">Make your work</span>{" "}
                <span className="gradient-text">impossible to ignore</span>
              </h2>

              <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
                Create a DevLink profile, showcase projects, collect reviews, and connect with studios and clients that value quality.
              </p>

            </div>

            {/* Right action card */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] opacity-40"
                   style={{ background: "linear-gradient(135deg, rgba(var(--color-accent-rgb),0.25), rgba(var(--color-accent-2-rgb),0.18), transparent)" }} />
              <div className="relative rounded-[2rem] bg-white/[0.03] border border-white/10 p-6">
                <div className="text-sm text-white/70">{isLoggedIn ? "Welcome back" : "Start in minutes"}</div>
                <div className="mt-1 text-xl font-semibold text-white">{isLoggedIn ? "Open DevLink" : "Create your profile"}</div>
                <div className="mt-4 flex flex-col gap-3">
                  <Link href={isLoggedIn ? "/home" : "/register"}>
                    <button className="w-full btn-gradient btn-press px-5 py-3 rounded-2xl font-semibold text-white shadow-lg shadow-[var(--color-accent)]/25">
                      {isLoggedIn ? "Go to feed" : "Create free account"}
                    </button>
                  </Link>
                  <Link href="/discover">
                    <button className="w-full px-5 py-3 rounded-2xl font-semibold text-white/90 border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/25">
                      Discover developers
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
