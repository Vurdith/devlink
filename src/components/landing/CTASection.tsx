// Server Component - no client JS needed
import Link from "next/link";
import { surface } from "@/components/ui/design-system";
import { PrimaryButton, SecondaryButton } from "./ActionButtons";

export function CTASection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative px-4 py-16 md:py-20">
      <div className="max-w-5xl mx-auto">

        <div
          className={surface("panel", "relative overflow-hidden")}
          style={{
            background:
              "linear-gradient(135deg, rgba(var(--color-accent-2-rgb),0.08) 0%, rgba(10,13,18,0.97) 38%, rgba(10,13,18,0.97) 66%, rgba(var(--color-accent-rgb),0.07) 100%)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <div className="absolute top-0 left-[20%] right-[20%] h-px" style={{
            background: "linear-gradient(90deg, transparent, rgba(var(--color-accent-2-rgb),0.62), rgba(var(--color-accent-rgb),0.45), transparent)",
          }} />

          {/* Layout */}
          <div className="relative grid gap-10 p-8 sm:p-10 md:grid-cols-2 md:p-12 items-center">

            <div>
              <h2 className="text-3xl sm:text-5xl font-bold font-[var(--font-space-grotesk)] tracking-normal leading-[1.08] text-white">
                Make your work{" "}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, var(--color-accent-2) 0%, var(--color-accent) 100%)" }}
                >
                  easier
                </span>{" "}
                to trust
              </h2>
              <p className="mt-5 text-base text-white/50 leading-relaxed max-w-md">
                Add the projects, reviews, and contact details a studio needs before it starts a conversation.
              </p>
            </div>

            {/* Right - action card */}
            <div className="relative">
              <div
                className="absolute -inset-px rounded-xl pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(var(--color-accent-2-rgb),0.24) 0%, rgba(var(--color-accent-rgb),0.16) 50%, transparent 80%)",
                }}
              />
              <div className={surface("panelMuted", "relative p-6 sm:p-8")}>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-1">
                  {isLoggedIn ? "Welcome back" : "Get started"}
                </p>
                <p className="text-2xl font-bold text-white font-[var(--font-space-grotesk)] mb-8">
                  {isLoggedIn ? "Open DevLink" : "Create your profile"}
                </p>
                <div className="flex flex-col gap-3">
                  <Link href={isLoggedIn ? "/home" : "/register"} className="block w-full">
                    <PrimaryButton className="w-full justify-center">
                  {isLoggedIn ? "Open home" : "Create free account"}
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
