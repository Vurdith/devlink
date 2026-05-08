"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function HeroNetworkBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { themeId } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;
        let particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];

        // Mouse positioning for interaction
        const mouse = { x: -1000, y: -1000, radius: 150 };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        const init = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            particles = [];
            const particleCount = Math.floor((width * height) / 12000); // Responsive density

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    radius: Math.random() * 1.5 + 0.5,
                });
            }
        };

        const draw = () => {
            // Very slight trail effect - always use a dark/translucent clear overlay for this theme
            ctx.fillStyle = "rgba(7, 9, 13, 0.36)";
            ctx.fillRect(0, 0, width, height);

            const rootStyles = getComputedStyle(document.documentElement);
            const rawColor = rootStyles.getPropertyValue("--color-accent-2-rgb").trim() || "34, 211, 238";

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls smoothly
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // Mouse interaction (repel slightly, glow strongly)
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const isNearMouse = distance < mouse.radius;

                if (isNearMouse) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    p.x -= dx * force * 0.03;
                    p.y -= dy * force * 0.03;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, isNearMouse ? p.radius * 2 : p.radius, 0, Math.PI * 2);

                // Dynamic opacity based on mouse proximity
                const opacity = isNearMouse ? 0.8 : 0.3;
                ctx.fillStyle = `rgba(${rawColor}, ${opacity})`;
                ctx.fill();

                // Connect particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    if (dist2 < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);

                        // Connection opacity is stronger if both particles are near mouse
                        const lineOpacity = isNearMouse && Math.sqrt(Math.pow(mouse.x - p2.x, 2) + Math.pow(mouse.y - p2.y, 2)) < mouse.radius
                            ? (1 - dist2 / 120) * 0.4
                            : (1 - dist2 / 120) * 0.1;

                        ctx.strokeStyle = `rgba(${rawColor}, ${lineOpacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        init();
        draw();

        window.addEventListener("resize", init);

        return () => {
            window.removeEventListener("resize", init);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [themeId]);

    // Apply a powerful vignette over the canvas to blend it seamlessly into the background
    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[var(--color-background)] pointer-events-none">
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08)_0%,rgba(7,9,13,0.34)_42%,var(--color-background)_100%)] opacity-90" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.12),var(--color-background)_96%)]" />
        </div>
    );
}
