"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/providers/ThemeProvider";

export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { logoPath } = useTheme();
  
  return (
    <section className="relative overflow-hidden px-4 pt-24 pb-16 md:pt-28 md:pb-24">
      {/* Background – curated, not “template-y” */}
      <div className="absolute inset-0 gradient-bg" />
      <div className="absolute inset-0 grid-pattern opacity-60" />
      <div
        className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full orb opacity-70"
        style={{ background: "radial-gradient(circle, rgba(var(--color-accent-rgb),0.22) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-48 -right-48 w-[640px] h-[640px] rounded-full orb-delayed opacity-60"
        style={{ background: "radial-gradient(circle, rgba(var(--color-accent-2-rgb),0.18) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
          {/* Left: copy */}
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute -inset-2 rounded-2xl opacity-50" style={{ background: "radial-gradient(circle, rgba(var(--color-accent-rgb),0.35), transparent 70%)" }} />
                <Image
                  src={logoPath}
                  alt="DevLink"
                  width={96}
                  height={96}
                  className="relative w-14 h-14 md:w-16 md:h-16 object-contain"
                  priority
                />
              </div>
              <div className="text-left">
                <div className="text-sm text-white/60">DevLink</div>
                <div className="text-xs text-white/40">Roblox developer network</div>
              </div>
            </div>

            <h1 className="font-[var(--font-space-grotesk)] font-bold tracking-tight text-white text-4xl sm:text-5xl md:text-6xl leading-[1.02]">
              Build credibility.
              <br />
              <span className="gradient-text">Find collaborators.</span>
              <br />
              Ship better games.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
              DevLink helps Roblox developers, studios, and clients connect with proof: portfolios, verified profiles, and a
              community feed focused on real work.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
              <Link href={isLoggedIn ? "/home" : "/register"} className="inline-flex">
                <button className="btn-gradient btn-press px-6 py-3 rounded-2xl font-semibold text-white shadow-lg shadow-[var(--color-accent)]/25">
                  {isLoggedIn ? "Go to feed" : "Create your profile"}
                </button>
              </Link>
              <Link href="/discover" className="inline-flex">
                <button className="px-6 py-3 rounded-2xl font-semibold text-white/90 border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/25">
                  Discover
                </button>
              </Link>
            </div>
          </div>

          {/* Right: “product” preview – handcrafted mock */}
          <div className="animate-fade-in" style={{ animationDelay: "0.08s" }}>
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] opacity-40" style={{ background: "linear-gradient(135deg, rgba(var(--color-accent-rgb),0.25), rgba(var(--color-accent-2-rgb),0.18), transparent)" }} />

              <div className="relative glass rounded-[2rem] border border-white/10 overflow-hidden noise-overlay">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(900px 260px at 30% 0%, rgba(var(--color-accent-rgb),0.14), transparent 60%), radial-gradient(800px 260px at 90% 10%, rgba(var(--color-accent-2-rgb),0.10), transparent 62%)",
                  }}
                />

                {/* Top bar */}
                <div className="relative px-5 pt-5 pb-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  </div>
                  <div className="text-xs text-white/45">Preview</div>
                </div>

                {/* Content */}
                <div className="relative p-5 space-y-4">
                  {/* Profile card */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-2)]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-white truncate">Reece Leneveu</div>
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-[rgba(var(--color-accent-rgb),0.14)] border border-[rgba(var(--color-accent-rgb),0.22)] text-white/80">
                            Verified
                          </span>
                        </div>
                        <div className="text-xs text-white/50 truncate">Scripter • UI engineer • Studio collaborator</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 h-9 rounded-xl bg-white/[0.04] border border-white/10" />
                      <div className="w-10 h-9 rounded-xl bg-white/[0.04] border border-white/10" />
                    </div>
                  </div>

                  {/* Feed snippet */}
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white/85">
                          <span className="font-semibold">New portfolio drop:</span>{" "}
                          <span className="text-white/70">
                            movement system + camera polish for an obby prototype. Looking for a builder.
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-white/45">
                          <span>2h</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span>12 likes</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span>3 replies</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Small metrics row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Followers", val: "1.2k" },
                      { label: "Projects", val: "18" },
                      { label: "Reviews", val: "4.9" },
                    ].map((x) => (
                      <div key={x.label} className="rounded-2xl bg-white/[0.03] border border-white/10 p-3 text-center">
                        <div className="text-white font-semibold">{x.val}</div>
                        <div className="text-[11px] text-white/45">{x.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/35">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="mt-14 flex justify-center">
          <div className="w-6 h-10 border border-white/15 rounded-full flex justify-center bg-white/[0.02]">
            <div className="w-1.5 h-3 bg-white/35 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
