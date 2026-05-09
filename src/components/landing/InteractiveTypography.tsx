"use client";
import React from "react";
import { motion } from "framer-motion";

export function InteractiveTypography() {
    return (
        <div className="relative z-10 mx-auto mb-2 flex w-full max-w-[1040px] cursor-default flex-col items-center pb-4 pt-12 sm:pt-16">

            <h1
                className="flex flex-col items-center text-center text-[3.75rem] font-bold leading-[0.86] tracking-normal sm:text-7xl md:text-[7.5rem] lg:text-[8.75rem]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
                <motion.span
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 block pb-4 text-white sm:pb-6"
                >
                    Engineering
                </motion.span>

                {/* Slice & Reveal Effect */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="perspective-[1500px] group relative inline-block cursor-crosshair"
                >
                    {/* Top Half of the slice */}
                    <span
                        className="absolute inset-0 block transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom group-hover:-translate-y-6 group-hover:-rotate-[4deg] group-hover:scale-[1.03] z-20"
                        style={{ clipPath: "polygon(0 0, 100% 0, 100% 41%, 0 49%)", WebkitClipPath: "polygon(0 0, 100% 0, 100% 41%, 0 49%)" }}
                    >
                        <span className="block h-full w-full bg-gradient-to-br from-[var(--color-accent-2)] via-white to-[var(--color-accent)] bg-clip-text text-transparent">
                            Greatness.
                        </span>
                    </span>

                    {/* Bottom Half of the slice */}
                    <span
                        className="absolute inset-0 block transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-top group-hover:translate-y-6 group-hover:rotate-[4deg] group-hover:scale-[1.03] z-20"
                        style={{ clipPath: "polygon(0 49%, 100% 41%, 100% 100%, 0 100%)", WebkitClipPath: "polygon(0 49%, 100% 41%, 100% 100%, 0 100%)" }}
                    >
                        <span className="block h-full w-full bg-gradient-to-br from-[var(--color-accent-2)] via-white to-[var(--color-accent)] bg-clip-text text-transparent">
                            Greatness.
                        </span>
                    </span>

                    {/* The glowing secret revealed inside the slice */}
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-75 z-10 group-hover:scale-110">
                        <span className="whitespace-nowrap text-[10px] font-bold uppercase text-white sm:text-sm md:text-lg md:tracking-[0.28em]">
                            Defy The Standards.
                        </span>
                    </span>

                    {/* Invisible spacer so the div has actual height and width to render absolute children correctly */}
                    <span className="block invisible text-transparent pointer-events-none pb-2">
                        Greatness.
                    </span>
                </motion.div>
            </h1>
        </div>
    );
}
