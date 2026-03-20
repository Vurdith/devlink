"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface Connection {
  from: number;
  to: number;
}

export function NeonCircuitHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let width = 0;
    let height = 0;
    
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      width = rect.width;
      height = rect.height;
      initParticles();
    };
    
    const colors = ["#6366f1", "#8b5cf6", "#0ea5e9", "#ec4899"];
    
    const initParticles = () => {
      const particles: Particle[] = [];
      const count = Math.floor((width * height) / 8000);
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: 1 + Math.random() * 2,
          alpha: 0.2 + Math.random() * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      particlesRef.current = particles;
    };
    
    resize();
    window.addEventListener("resize", resize);
    
    const animate = () => {
      timeRef.current += 0.005;
      
      ctx.fillStyle = "rgba(5, 5, 12, 0.1)";
      ctx.fillRect(0, 0, width, height);
      
      const particles = particlesRef.current;
      
      // Update and draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        
        // Gentle wave motion
        p.x += Math.sin(timeRef.current + i * 0.1) * 0.1;
        p.y += Math.cos(timeRef.current + i * 0.1) * 0.1;
        
        // Draw particle
        const pulse = Math.sin(timeRef.current * 2 + i) * 0.3 + 0.7;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * pulse;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.globalAlpha = 1;
      
      // Draw connections between nearby particles
      const connectionDistance = 120;
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw some accent lines (horizontal circuit traces)
      const numLines = 5;
      for (let i = 0; i < numLines; i++) {
        const y = (height / numLines) * i + Math.sin(timeRef.current + i) * 20;
        const lineWidth = 100 + Math.sin(timeRef.current * 0.5 + i * 2) * 50;
        const startX = (timeRef.current * 30 + i * 200) % (width + lineWidth) - lineWidth;
        
        const gradient = ctx.createLinearGradient(startX, y, startX + lineWidth, y);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.5, `rgba(139, 92, 246, 0.1)`);
        gradient.addColorStop(1, "transparent");
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + lineWidth, y);
        ctx.stroke();
      }
      
      // Draw glowing orbs
      const orbPositions = [
        { x: width * 0.2, y: height * 0.3 },
        { x: width * 0.8, y: height * 0.6 },
        { x: width * 0.5, y: height * 0.8 }
      ];
      
      orbPositions.forEach((pos, i) => {
        const pulse = Math.sin(timeRef.current * 1.5 + i * 2) * 0.5 + 0.5;
        const radius = 80 + pulse * 30;
        
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
        gradient.addColorStop(0, `rgba(99, 102, 241, ${0.03 * pulse})`);
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.015 * pulse})`);
        gradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-[var(--background)] opacity-50" />
    </div>
  );
}
