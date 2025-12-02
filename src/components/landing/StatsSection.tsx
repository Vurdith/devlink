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
  const stats = [
    {
      value: totalUsers,
      label: "Active Members",
      sublabel: "Growing daily",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "from-red-600 to-red-500",
      textColor: "text-red-500",
      glowColor: "rgba(220, 38, 38, 0.2)",
    },
    {
      value: totalPosts,
      label: "Community Posts",
      sublabel: "Shared by creators",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: "from-cyan-500 to-blue-500",
      textColor: "text-cyan-400",
      glowColor: "rgba(34, 211, 238, 0.2)",
    },
    {
      value: totalStudios,
      label: "Studios",
      sublabel: "Building games",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "from-pink-500 to-rose-500",
      textColor: "text-pink-400",
      glowColor: "rgba(244, 114, 182, 0.2)",
    },
  ];

  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/5 to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-[var(--font-space-grotesk)]">
            <span className="text-white">Join a </span>
            <span className="gradient-text">Thriving Community</span>
          </h2>
          <p className="text-lg text-[var(--muted-foreground)]">
            Be part of something bigger. Connect with thousands of Roblox creators.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative p-8 rounded-3xl bg-[#0d0d12] border border-white/10 overflow-hidden text-center transition-transform duration-300 hover:-translate-y-1">
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 100%, ${stat.glowColor} 0%, transparent 70%)`
                  }}
                />

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4 transition-transform duration-200 hover:scale-110 hover:rotate-3`}>
                  <span className="text-white">{stat.icon}</span>
                </div>

                {/* Number */}
                <div className={`text-5xl md:text-6xl font-bold ${stat.textColor} mb-2 font-[var(--font-space-grotesk)]`}>
                  <AnimatedCounter value={stat.value} />
                  <span className="text-3xl">+</span>
                </div>

                {/* Label */}
                <div className="text-xl font-semibold text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  {stat.sublabel}
                </div>
              </div>

              {/* Decorative elements */}
              <div 
                className="absolute -bottom-2 -right-2 w-24 h-24 opacity-20 rounded-full blur-2xl"
                style={{ background: `linear-gradient(135deg, ${stat.glowColor.replace('0.2', '1')}, transparent)` }}
              />
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#0d0d12] border border-white/10">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-pink-500 border-2 border-[var(--background)] flex items-center justify-center text-xs font-bold text-white"
                >
                  {String.fromCharCode(65 + i - 1)}
                </div>
              ))}
            </div>
            <span className="text-[var(--muted-foreground)]">
              Join <span className="text-white font-semibold">{totalUsers}+</span> developers today
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
