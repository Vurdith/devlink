"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { InteractiveTypography } from "./InteractiveTypography";

const stagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.16 } },
  },
  item: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.76, ease: [0.16, 1, 0.3, 1] as const },
    },
  },
};

function BrandSignalScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,11,17,0.34),rgba(7,9,13,0.82)_74%,var(--color-background))]" />
      <div className="absolute inset-y-0 right-[-18vw] w-[58vw] rotate-[9deg] border-l border-white/[0.07] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.045),rgba(var(--color-accent-rgb),0.08),transparent)]" />
      <div className="absolute inset-y-[-18vh] right-[6vw] w-px rotate-[9deg] bg-[linear-gradient(180deg,transparent,rgba(var(--color-accent-2-rgb),0.42),transparent)]" />
      <div className="absolute left-[18%] top-[18%] h-px w-[62vw] origin-left rotate-[-8deg] bg-[linear-gradient(90deg,transparent,rgba(var(--color-accent-rgb),0.38),rgba(255,255,255,0.2),transparent)]" />
      <div className="absolute left-[20%] bottom-[20%] h-px w-[70vw] origin-left rotate-[5deg] bg-[linear-gradient(90deg,transparent,rgba(var(--color-accent-2-rgb),0.32),transparent)]" />

      <motion.div
        className="absolute right-[-22vw] top-1/2 hidden h-[min(70vw,840px)] w-[min(70vw,840px)] -translate-y-1/2 opacity-80 md:block"
        animate={{ y: [0, -14, 0], rotate: [-2.5, 1.2, -2.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-[-9%] rounded-[42px] border border-white/[0.07] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(var(--color-accent-rgb),0.08))] backdrop-blur-sm" />
        <div className="absolute inset-[10%] rounded-[34px] border border-[rgba(var(--color-accent-2-rgb),0.18)]" />
        <div className="absolute left-[-12%] top-[26%] h-20 w-[120%] rotate-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)] opacity-50 blur-xl" />
        <Image
          src="/logo/logo.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 680px, 0px"
          className="object-contain opacity-90 saturate-125"
        />
      </motion.div>

      <motion.div
        className="absolute right-[-355px] top-[300px] h-[540px] w-[540px] opacity-[0.18] md:hidden"
        animate={{ y: [0, -10, 0], rotate: [-3, 1, -3] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/logo/logo.png"
          alt=""
          fill
          sizes="560px"
          className="object-contain saturate-125"
        />
      </motion.div>

      <motion.div
        className="absolute -bottom-28 left-1/2 h-[360px] w-[720px] -translate-x-1/2 rounded-[100%] border border-white/[0.07] md:-bottom-36 md:left-[62%]"
        animate={{ scaleX: [1, 1.04, 1], opacity: [0.42, 0.72, 0.42] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative isolate flex min-h-[92dvh] w-full flex-col justify-center overflow-hidden px-5 pb-16 pt-20 selection:bg-[rgba(var(--color-accent-2-rgb),0.25)] md:pt-16">
      <BrandSignalScene />

      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto w-full max-w-7xl"
      >
        <div className="max-w-[900px]">
          <motion.div variants={stagger.item}>
            <InteractiveTypography />
          </motion.div>

          <motion.div variants={stagger.item} className="max-w-3xl">
            <p className="text-base font-medium leading-8 tracking-normal text-white/66 md:text-xl">
              DevLink gives Roblox creators one sharp profile for builds,
              reviews, rates, and availability, so studios can choose from the
              work instead of scattered DMs.
            </p>
          </motion.div>

          <motion.div
            variants={stagger.item}
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row"
          >
            <PremiumButton href={isLoggedIn ? "/home" : "/register"} showArrow>
              {isLoggedIn ? "Open home" : "Create your DevLink"}
            </PremiumButton>
            <PremiumButton href="/discover" variant="secondary">
              Browse creators
            </PremiumButton>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
