"use client";
import React from "react";
import { motion } from "framer-motion";

export function InteractiveTypography() {
    return (
        <div className="relative w-full max-w-[1200px] mx-auto pt-16 pb-4 flex flex-col items-center cursor-default z-10 mb-2">

            <h1
                className="text-[4.5rem] sm:text-7xl md:text-[8rem] lg:text-[10rem] font-bold tracking-tighter leading-[0.8] text-center flex flex-col items-center"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
                <motion.span
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="block text-white pb-4 sm:pb-8 relative z-10"
                >
                    Engineering
                </motion.span>

                {/* Slice & Reveal Effect */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative inline-block cursor-crosshair perspective-[1500px] group"
                >
                    {/* Top Half of the slice */}
                    <span
                        className="absolute inset-0 block transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom group-hover:-translate-y-6 group-hover:-rotate-[4deg] group-hover:scale-[1.03] z-20"
                        style={{ clipPath: "polygon(0 0, 100% 0, 100% 41%, 0 49%)", WebkitClipPath: "polygon(0 0, 100% 0, 100% 41%, 0 49%)" }}
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-fuchsia-400 to-indigo-400 block w-full h-full">
                            Greatness.
                        </span>
                    </span>

                    {/* Bottom Half of the slice */}
                    <span
                        className="absolute inset-0 block transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] origin-top group-hover:translate-y-6 group-hover:rotate-[4deg] group-hover:scale-[1.03] z-20"
                        style={{ clipPath: "polygon(0 49%, 100% 41%, 100% 100%, 0 100%)", WebkitClipPath: "polygon(0 49%, 100% 41%, 100% 100%, 0 100%)" }}
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-fuchsia-400 to-indigo-400 block w-full h-full">
                            Greatness.
                        </span>
                    </span>

                    {/* The glowing secret revealed inside the slice */}
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-75 z-10 group-hover:scale-110">
                        <span className="text-[10px] sm:text-sm md:text-xl md:tracking-[0.4em] uppercase text-white font-bold drop-shadow-[0_0_20px_rgba(232,121,249,0.8)] whitespace-nowrap">
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
