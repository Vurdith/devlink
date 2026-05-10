"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { InteractiveTypography } from "./InteractiveTypography";

const PrimaryCTA = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => (
  <Link
    href={href}
    className="group relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/[0.12] bg-[linear-gradient(135deg,var(--color-accent),#5f6cf6_52%,var(--color-accent-2))] px-8 py-3.5 text-sm font-semibold text-white outline-none transition-all duration-200 hover:border-white/20 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.68)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:scale-[0.98] sm:px-10"
  >
    <div className="absolute inset-0 translate-x-[-100%] skew-x-[-25deg] bg-[linear-gradient(to_right,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_100%)] group-hover:animate-[shimmer-sweep_1.2s_infinite]" />
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
    className="group relative inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.045] px-8 py-3.5 text-sm font-semibold text-white/90 outline-none transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.56)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:scale-[0.98] sm:px-10"
  >
    <span className="relative flex items-center gap-2">{children}</span>
  </Link>
);

/* Stagger helpers */
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
    <section className="relative flex min-h-[92dvh] w-full flex-col items-center justify-center overflow-hidden selection:bg-[rgba(var(--color-accent-2-rgb),0.25)]">
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-col items-center px-5 text-center"
      >
        <motion.div variants={stagger.item}>
          <InteractiveTypography />
        </motion.div>

        <motion.div
          variants={stagger.item}
          className="group mb-8 flex max-w-2xl cursor-default flex-wrap justify-center gap-x-1.5"
        >
          {"Show the Roblox work you are proud of, find trusted collaborators, and move from first message to shipped project with less guesswork."
            .split(" ")
            .map((word, i) => (
              <span key={i} className="relative overflow-visible">
                <span className="block text-base font-medium leading-[1.65] tracking-normal text-white/52 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:opacity-0 md:text-xl">
                  {word}
                </span>
                <span
                  className="absolute inset-0 translate-y-1 text-base font-medium leading-[1.65] tracking-normal text-white opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 md:text-xl"
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
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <PrimaryCTA href={isLoggedIn ? "/home" : "/register"}>
            {isLoggedIn ? "Open home" : "Create your profile"}
            <ArrowUpRight className="w-5 h-5 opacity-90 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </PrimaryCTA>
          <SecondaryCTA href="/discover">Explore developers</SecondaryCTA>
        </motion.div>
      </motion.div>
    </section >
  );
}
