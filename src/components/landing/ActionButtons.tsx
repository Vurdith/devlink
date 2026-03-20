"use client";

import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
}

export function PrimaryButton({ children, className, ...props }: ButtonProps) {
    return (
        <button
            className={`group relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] overflow-hidden ${className || ""}`}
            style={{
                background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-2) 100%)",
                boxShadow: "0 0 20px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
                e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "0 0 20px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "translateY(0)";
            }}
            {...props}
        >
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer-sweep_1s_ease-out]" />
            <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">{children}</span>
        </button>
    );
}

export function SecondaryButton({ children, className, ...props }: ButtonProps) {
    return (
        <button
            className={`group relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] ${className || ""}`}
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.8)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                e.currentTarget.style.transform = "translateY(0)";
            }}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </button>
    );
}
