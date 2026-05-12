"use client";

import { motion } from "framer-motion";

export function InteractiveTypography() {
  return (
    <div className="relative z-10 mb-5 flex w-full max-w-[900px] cursor-default flex-col items-start pb-2 pt-10 sm:pt-14">
      <h1
        className="flex flex-col items-start text-left text-[3.1rem] font-bold leading-[0.9] tracking-normal sm:text-7xl md:text-[6.6rem] lg:text-[7.2rem]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        <motion.span
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 block pb-3 text-white sm:pb-5"
        >
          Roblox hiring
        </motion.span>

        <motion.span
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="block bg-gradient-to-br from-white via-[var(--color-accent-2)] to-[var(--color-accent)] bg-clip-text pb-2 text-transparent"
        >
          judged by the work.
        </motion.span>
      </h1>
    </div>
  );
}
