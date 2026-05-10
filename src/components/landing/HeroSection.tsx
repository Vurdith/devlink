"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Image as ImageIcon, Send, Star } from "lucide-react";
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
  return (
    <section className="relative flex min-h-[92dvh] w-full flex-col justify-center overflow-hidden pb-16 pt-20 selection:bg-[rgba(var(--color-accent-2-rgb),0.25)] md:pt-0">
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto grid w-full max-w-[1180px] items-center gap-10 px-5 text-left lg:grid-cols-[minmax(0,1fr)_410px]"
      >
        <div className="min-w-0">
          <motion.div variants={stagger.item}>
            <InteractiveTypography />
          </motion.div>

          <motion.div variants={stagger.item} className="mb-8 max-w-2xl">
            <p className="text-base font-medium leading-8 tracking-normal text-white/62 md:text-xl">
              DevLink puts Roblox portfolios, reviews, jobs, and messages in one place so clients can judge the work before they start the conversation.
            </p>
          </motion.div>

          <motion.div
            variants={stagger.item}
            className="flex flex-col items-stretch gap-3 sm:flex-row"
          >
            <PrimaryCTA href={isLoggedIn ? "/home" : "/register"}>
              {isLoggedIn ? "Open home" : "Create your profile"}
              <ArrowUpRight className="w-5 h-5 opacity-90 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </PrimaryCTA>
            <SecondaryCTA href="/discover">Explore developers</SecondaryCTA>
          </motion.div>
        </div>

        <motion.div variants={stagger.item} className="relative mt-4 w-full max-w-[410px] justify-self-start lg:mt-0">
          <div className="absolute -inset-8 rounded-[2.25rem] bg-[radial-gradient(circle_at_18%_20%,rgba(var(--color-accent-2-rgb),0.30),transparent_31%),radial-gradient(circle_at_86%_70%,rgba(var(--color-accent-rgb),0.28),transparent_40%)] blur-2xl" />
          <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[rgba(8,11,17,0.82)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            <div className="absolute -right-10 top-8 h-40 w-40 rounded-full border border-white/[0.08] bg-[rgba(var(--color-accent-rgb),0.08)] blur-sm" />

            <div className="relative rounded-[1.35rem] border border-white/[0.10] bg-[rgba(3,5,10,0.52)] p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl border border-white/[0.14] bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] p-[2px]">
                  <div className="flex h-full w-full items-center justify-center rounded-[0.9rem] bg-[rgba(5,7,12,0.78)] text-base font-black text-white">
                    R
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-bold text-white">Reece Leneveu</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-white/52">
                    <span>@reeceleneveu</span>
                    <span>4.8 rating</span>
                  </div>
                </div>
                <div className="rounded-full border border-[rgba(var(--color-accent-2-rgb),0.42)] bg-[rgba(var(--color-accent-2-rgb),0.11)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">
                  Developer
                </div>
              </div>

              <div className="mt-5 grid grid-cols-[1.25fr_0.75fr] gap-2.5">
                <div className="min-h-28 rounded-2xl border border-white/[0.09] bg-[linear-gradient(135deg,rgba(var(--color-accent-rgb),0.18),rgba(255,255,255,0.035))] p-3">
                  <ImageIcon className="h-4 w-4 text-[var(--color-accent-2)]" />
                  <div className="mt-8 text-sm font-bold leading-5 text-white">Anime VFX landing page</div>
                  <div className="mt-1 text-xs font-medium text-white/48">3 media files</div>
                </div>
                <div className="rounded-2xl border border-white/[0.09] bg-white/[0.045] p-3">
                  <div className="flex gap-1 text-[var(--color-accent-2)]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-7 text-xs font-semibold leading-5 text-white/70">
                    &quot;Clean handoff, fast revisions.&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="relative ml-auto mt-4 w-[88%] rounded-[1.35rem] border border-white/[0.10] bg-[rgba(22,24,32,0.90)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white">Studio Developers</div>
                  <p className="mt-1 text-sm leading-6 text-white/52">
                    Can you take on a shop UI and checkout flow this week?
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-[rgba(var(--color-accent-rgb),0.12)] text-[var(--color-accent-2)]">
                  <Send className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="relative mt-4 w-[78%] rounded-[1.35rem] border border-white/[0.10] bg-[rgba(3,5,10,0.86)] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-white">Open Roblox UI contract</div>
                  <div className="mt-1 text-xs font-semibold text-white/45">Matched from profile skills</div>
                </div>
                <div className="rounded-full bg-[rgba(var(--color-accent-2-rgb),0.14)] px-3 py-1 text-xs font-bold text-[var(--color-accent-2)]">
                  Apply
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
