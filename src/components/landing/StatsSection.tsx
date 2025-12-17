"use client";

import { useRef, useEffect, useState } from "react";

interface StatsSectionProps {
  totalUsers: number;
  totalPosts: number;
  totalStudios: number;
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          let animationFrame: number;

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * value));

            if (progress < 1) {
              animationFrame = requestAnimationFrame(animate);
            }
          };

          animationFrame = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function StatsSection({ totalUsers, totalPosts, totalStudios }: StatsSectionProps) {
  return (
    <section className="relative px-4 py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
          {/* Left: message */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
              Momentum
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-space-grotesk)] tracking-tight">
              <span className="text-white">A community that</span>{" "}
              <span className="gradient-text">actually ships</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
              A feed for progress, profiles for proof, and connections that turn into real projects.
            </p>

            {/* Metric strip */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Members",
                  value: totalUsers,
                  tint: "rgba(var(--color-accent-rgb),0.16)",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-1a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v1" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 21v-1a4 4 0 0 0-3-3.87" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  ),
                },
                {
                  label: "Posts",
                  value: totalPosts,
                  tint: "rgba(34,211,238,0.14)",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8M8 15h6" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
                    </svg>
                  ),
                },
                {
                  label: "Studios",
                  value: totalStudios,
                  tint: "rgba(244,114,182,0.14)",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
                    </svg>
                  ),
                },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="relative overflow-hidden rounded-2xl glass border border-white/10 p-4 animate-fade-in noise-overlay"
                  style={{ animationDelay: `${0.06 + i * 0.05}s` }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none opacity-60"
                    style={{ background: `radial-gradient(520px 160px at 30% 0%, ${s.tint}, transparent 60%)` }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="text-white/60 text-xs">{s.label}</div>
                    <div className="text-white/55">{s.icon}</div>
                  </div>
                  <div className="relative mt-2 font-[var(--font-space-grotesk)] text-3xl font-bold text-white">
                    <AnimatedCounter value={s.value} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: lightweight “activity” panel */}
          <div className="animate-fade-in" style={{ animationDelay: "0.08s" }}>
            <div className="relative overflow-hidden rounded-[2rem] glass border border-white/10 noise-overlay">
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-60"
                style={{
                  background:
                    "radial-gradient(900px 260px at 30% 0%, rgba(var(--color-accent-rgb),0.14), transparent 60%), radial-gradient(800px 260px at 90% 15%, rgba(var(--color-accent-2-rgb),0.10), transparent 62%)",
                }}
              />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-white font-semibold">This week</div>
                    <div className="text-sm text-white/55">New posts & collaborations</div>
                  </div>
                  <div className="text-xs text-white/45">Live</div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-end">
                  {[6, 8, 5, 10, 12, 9, 14, 11, 8, 13, 9, 15].map((h, idx) => (
                    <div
                      key={idx}
                      className="col-span-1 rounded-lg bg-white/[0.04] border border-white/10 overflow-hidden"
                      style={{ height: 120 }}
                    >
                      <div
                        className="w-full rounded-lg"
                        style={{
                          height: `${h * 6}px`,
                          marginTop: `${120 - h * 6}px`,
                          background:
                            idx % 3 === 0
                              ? "linear-gradient(180deg, rgba(var(--color-accent-rgb),0.75), rgba(var(--color-accent-rgb),0.15))"
                              : idx % 3 === 1
                                ? "linear-gradient(180deg, rgba(var(--color-accent-2-rgb),0.65), rgba(var(--color-accent-2-rgb),0.12))"
                                : "linear-gradient(180deg, rgba(244,114,182,0.60), rgba(244,114,182,0.12))",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-white/45">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
