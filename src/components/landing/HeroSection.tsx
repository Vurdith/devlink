"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, MessageSquare } from "lucide-react";
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
  const workflowRows = [
    {
      icon: BadgeCheck,
      title: "Portfolio",
      body: "Builds, media, skills, and profile signals sit together.",
    },
    {
      icon: MessageSquare,
      title: "Messages",
      body: "Clients can move from profile check to conversation quickly.",
    },
    {
      icon: BriefcaseBusiness,
      title: "Jobs",
      body: "Project posts and applications stay connected to reputation.",
    },
  ];

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

          <motion.div
            variants={stagger.item}
            className="mb-8 max-w-2xl"
          >
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
          <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_30%_10%,rgba(var(--color-accent-2-rgb),0.28),transparent_34%),radial-gradient(circle_at_85%_70%,rgba(var(--color-accent-rgb),0.22),transparent_38%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.12] bg-[rgba(8,11,17,0.58)] p-4 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            <div className="rounded-[1.25rem] border border-white/[0.09] bg-[rgba(3,5,10,0.50)] p-4">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-2xl border border-white/12 bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] p-[2px]">
                  <div className="flex h-full w-full items-center justify-center rounded-[0.9rem] bg-[rgba(5,7,12,0.76)] text-lg font-black text-white">
                    D
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-lg font-bold text-white">Studio builder</div>
                    <div className="rounded-full border border-[rgba(var(--color-accent-2-rgb),0.45)] bg-[rgba(var(--color-accent-2-rgb),0.12)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-accent-2)]">
                      Developer
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-white/54">
                    <span>12 builds</span>
                    <span>4.8 rating</span>
                    <span>2 open jobs</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {workflowRows.map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.34)] hover:bg-white/[0.07]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-[rgba(var(--color-accent-rgb),0.10)] text-[var(--color-accent-2)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white">{title}</div>
                      <div className="mt-0.5 text-sm leading-5 text-white/50">{body}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.035)] p-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-white/72">Ready for review</span>
                  <span className="rounded-full bg-[rgba(var(--color-accent-2-rgb),0.14)] px-3 py-1 text-xs font-bold text-[var(--color-accent-2)]">
                    View profile
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
