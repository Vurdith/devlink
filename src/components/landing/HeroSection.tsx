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
    className="group relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/[0.12] bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] px-8 py-3.5 text-sm font-semibold !text-white outline-none transition-all duration-200 hover:border-white/20 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[rgba(var(--color-accent-2-rgb),0.68)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:scale-[0.98] sm:px-10"
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
  const proofPoints = [
    ["Portfolio proof", "Show the work before the pitch"],
    ["Trusted profiles", "Reviews, roles, rates, and response time"],
    ["Project flow", "Move from search to message to job"],
  ];

  return (
    <section className="relative flex min-h-[92dvh] w-full flex-col justify-center overflow-hidden pb-16 pt-20 selection:bg-[rgba(var(--color-accent-2-rgb),0.25)] md:pt-0">
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-col items-start px-5 text-left"
      >
        <motion.div
          variants={stagger.item}
          className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-accent-2)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-2)]" aria-hidden="true" />
          Creator network
        </motion.div>

        <motion.div variants={stagger.item}>
          <InteractiveTypography />
        </motion.div>

        <motion.div
          variants={stagger.item}
          className="mb-8 max-w-2xl"
        >
          <p className="text-base font-medium leading-8 tracking-normal text-white/58 md:text-xl">
            DevLink gives Roblox developers, studios, and clients a cleaner way to judge work, find collaborators, and start serious projects without digging through scattered links.
          </p>
        </motion.div>

        <motion.div
          variants={stagger.item}
          className="flex flex-col items-stretch gap-3 sm:flex-row"
        >
          <PrimaryCTA href={isLoggedIn ? "/home" : "/register"}>
            {isLoggedIn ? "Open home" : "Create your profile"}
            <ArrowUpRight className="w-5 h-5 opacity-90 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </PrimaryCTA>
          <SecondaryCTA href="/discover">Explore developers</SecondaryCTA>
        </motion.div>

        <motion.div
          variants={stagger.item}
          className="mt-12 grid w-full max-w-5xl gap-3 sm:grid-cols-3"
        >
          {proofPoints.map(([title, body]) => (
            <div
              key={title}
              className="rounded-xl border border-white/[0.08] bg-[rgba(12,16,23,0.54)] p-4 backdrop-blur-sm"
            >
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="mt-1 text-sm leading-6 text-white/46">{body}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
