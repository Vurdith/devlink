"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { InteractiveTypography } from "./InteractiveTypography";

/* ─── Premium CTA buttons with Inline Gradient Fallbacks ─── */
const PrimaryCTA = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => (
  <Link
    href={href}
    className="group relative inline-flex items-center justify-center gap-2.5 rounded-2xl px-12 py-5 text-base font-bold transition-all duration-300 overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white hover:-translate-y-1.5 active:scale-95 outline-none transform-gpu"
  >
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_100%)] translate-x-[-100%] group-hover:animate-[shimmer-sweep_1.2s_infinite] skew-x-[-25deg]" />
    <span className="relative flex items-center gap-2 text-white">
      {children}
    </span>
  </Link>
);

const SecondaryCTA = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => (
  <Link
    href={href}
    className="group relative inline-flex items-center justify-center gap-2.5 rounded-2xl px-12 py-5 text-base font-semibold text-white/90 transition-all duration-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 outline-none hover:-translate-y-1.5 active:scale-95 transform-gpu"
  >
    <span className="relative flex items-center gap-2">{children}</span>
  </Link>
);

/* ─── Stagger helpers ─── */
const stagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  },
  item: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  },
};

export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden selection:bg-purple-500/30">
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center"
      >
        {/* Headline — Interactive Cinematic Typography */}
        <motion.div variants={stagger.item}>
          <InteractiveTypography />
        </motion.div>

        {/* Refined Interactive Subtitle */}
        <motion.div
          variants={stagger.item}
          className="max-w-2xl mb-8 flex flex-wrap justify-center gap-x-1.5 cursor-default group"
        >
          {"Beyond the standard portfolio. Find visionary collaborators, showcase your true capabilities, and assemble the team to build the next generation of games."
            .split(" ")
            .map((word, i) => (
              <span key={i} className="relative overflow-visible">
                <span className="text-lg md:text-2xl text-white/40 font-medium leading-[1.6] tracking-tight block transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:opacity-0">
                  {word}
                </span>
                <span
                  className="absolute inset-0 text-lg md:text-2xl text-white font-medium leading-[1.6] tracking-tight transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                  style={{ transitionDelay: `${i * 15}ms` }}
                >
                  {word}
                </span>
              </span>
            ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={stagger.item}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <PrimaryCTA href={isLoggedIn ? "/home" : "/register"}>
            {isLoggedIn ? "Go to Dashboard" : "Create your profile"}
            <ArrowUpRight className="w-5 h-5 opacity-90 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </PrimaryCTA>
          <SecondaryCTA href="/discover">Explore developers</SecondaryCTA>
        </motion.div>
      </motion.div>
    </section >
  );
}
