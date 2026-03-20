// Server Component – no client JS needed
import Link from "next/link";
import { PrimaryButton, SecondaryButton } from "./ActionButtons";

export function CTASection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative px-4 py-16 md:py-20">
      <div className="max-w-5xl mx-auto">

        {/* Premium glass card */}
        <div
          className="relative overflow-hidden rounded-[2.5rem]"
          style={{
            background:
              "linear-gradient(135deg, rgba(168,85,247,0.09) 0%, rgba(10,13,18,0.97) 40%, rgba(10,13,18,0.97) 60%, rgba(232,121,249,0.07) 100%)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-[20%] right-[20%] h-px" style={{
            background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.7), rgba(232,121,249,0.5), transparent)",
          }} />

          {/* Corner orbs */}
          <div className="absolute top-0 left-0 w-[450px] h-[320px] pointer-events-none" style={{
            background: "radial-gradient(ellipse at 0% 0%, rgba(168,85,247,0.22) 0%, transparent 65%)",
          }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] pointer-events-none" style={{
            background: "radial-gradient(ellipse at 100% 100%, rgba(232,121,249,0.16) 0%, transparent 65%)",
          }} />

          {/* Layout */}
          <div className="relative p-10 md:p-14 grid gap-10 md:grid-cols-2 items-center">

            {/* Left — headline */}
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold font-[var(--font-space-grotesk)] tracking-tight leading-[1.08] text-white">
                Make your work{" "}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-3) 100%)" }}
                >
                  impossible
                </span>{" "}
                to ignore
              </h2>
              <p className="mt-5 text-base text-white/50 leading-relaxed max-w-md">
                Create a DevLink profile, showcase projects, collect reviews, and
                connect with studios that value quality.
              </p>
            </div>

            {/* Right — action card */}
            <div className="relative">
              <div
                className="absolute -inset-px rounded-[1.5rem] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168,85,247,0.35) 0%, rgba(232,121,249,0.15) 50%, transparent 80%)",
                }}
              />
              <div
                className="relative rounded-[1.5rem] p-8"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-1">
                  {isLoggedIn ? "Welcome back" : "Get started"}
                </p>
                <p className="text-2xl font-bold text-white font-[var(--font-space-grotesk)] mb-8">
                  {isLoggedIn ? "Open DevLink" : "Create your profile"}
                </p>
                <div className="flex flex-col gap-3">
                  <Link href={isLoggedIn ? "/home" : "/register"} className="block w-full">
                    <PrimaryButton className="w-full justify-center">
                      {isLoggedIn ? "Go to feed" : "Create free account"}
                    </PrimaryButton>
                  </Link>
                  <Link href="/discover" className="block w-full">
                    <SecondaryButton className="w-full justify-center">
                      Discover developers
                    </SecondaryButton>
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
