"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function HeroNetworkBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { themeId } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let resizeFrameId: number | null = null;
        let width = 0;
        let height = 0;
        let particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
        const rawColor = getComputedStyle(document.documentElement).getPropertyValue("--color-accent-2-rgb").trim() || "34, 211, 238";

        const mouse = { x: -1000, y: -1000, radius: 150 };
        const mouseRadiusSq = mouse.radius * mouse.radius;

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        const scheduleResize = () => {
            if (resizeFrameId !== null) return;
            resizeFrameId = requestAnimationFrame(() => {
                resizeFrameId = null;
                init();
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        const init = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            particles = [];
            const particleCount = Math.min(110, Math.floor((width * height) / 14000));

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
            if (document.hidden) {
                animationFrameId = requestAnimationFrame(draw);
                return;
            }

            ctx.fillStyle = "rgba(7, 9, 13, 0.36)";
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const distanceSq = dx * dx + dy * dy;
                const isNearMouse = distanceSq < mouseRadiusSq;

                if (isNearMouse) {
                    const distance = Math.sqrt(distanceSq);
                    const force = (mouse.radius - distance) / mouse.radius;
                    p.x -= dx * force * 0.03;
                    p.y -= dy * force * 0.03;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, isNearMouse ? p.radius * 2 : p.radius, 0, Math.PI * 2);

                const opacity = isNearMouse ? 0.8 : 0.3;
                ctx.fillStyle = `rgba(${rawColor}, ${opacity})`;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const distanceBetweenSq = dx2 * dx2 + dy2 * dy2;

                    if (distanceBetweenSq < 14400) {
                        const dist2 = Math.sqrt(distanceBetweenSq);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);

                        const p2MouseDx = mouse.x - p2.x;
                        const p2MouseDy = mouse.y - p2.y;
                        const p2NearMouse = p2MouseDx * p2MouseDx + p2MouseDy * p2MouseDy < mouseRadiusSq;
                        const lineOpacity = isNearMouse && p2NearMouse
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

        window.addEventListener("resize", scheduleResize);

        return () => {
            window.removeEventListener("resize", scheduleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            if (resizeFrameId !== null) cancelAnimationFrame(resizeFrameId);
            cancelAnimationFrame(animationFrameId);
        };
    }, [themeId]);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-[var(--color-background)] pointer-events-none">
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-accent-2-rgb),0.08)_0%,rgba(7,9,13,0.34)_42%,var(--color-background)_100%)] opacity-90" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.12),var(--color-background)_96%)]" />
        </div>
    );
}
