"use client";
import React from "react";
import { motion } from "framer-motion";

export function InteractiveTypography() {
    return (
        <div className="relative z-10 mb-4 flex w-full max-w-[980px] cursor-default flex-col items-start pb-2 pt-10 sm:pt-14">

            <h1
                className="flex flex-col items-start text-left text-[3.3rem] font-bold leading-[0.88] tracking-normal sm:text-7xl md:text-[7.2rem] lg:text-[8rem]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
                <motion.span
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 block pb-3 text-white sm:pb-5"
                >
                    Roblox work
                </motion.span>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative inline-block"
                >
                    <span className="block bg-gradient-to-br from-[var(--color-accent-2)] via-white to-[var(--color-accent)] bg-clip-text pb-2 text-transparent">
                        ready to hire.
                    </span>
                </motion.div>
            </h1>
        </div>
    );
}
