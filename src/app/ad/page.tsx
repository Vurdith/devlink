"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ThemeLogoImg } from '@/components/ui/ThemeLogo';
import Link from 'next/link';

// Icon components
const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const CubeIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

// Pain point cards that flash
const painPoints = [
  { text: "Random Discord DMs?", icon: "💬" },
  { text: "Unverified work?", icon: "❓" },
  { text: "Missed deadlines?", icon: "⏰" },
  { text: "No protection?", icon: "🚫" },
];

// Features for the montage
const features = [
  { title: "Verified Portfolios", desc: "Real project history", icon: <ShieldIcon /> },
  { title: "Skill Ratings", desc: "Proof of work", icon: <SparklesIcon /> },
  { title: "Hyper-Precise Filters", desc: "Find the perfect match", icon: <CodeIcon /> },
  { title: "Secure Escrow", desc: "Protected payments", icon: <LockIcon /> },
];

// Team tools
const teamTools = [
  "Team Hubs",
  "Shared Task Boards", 
  "Project Chats",
  "Version Tracking",
];

// Marketplace features
const marketplace = [
  { action: "Sell", item: "assets" },
  { action: "License", item: "code" },
  { action: "Offer", item: "services" },
  { action: "Get", item: "hired" },
];

// Trust points
const trustPoints = [
  "Every dev is verified",
  "Every studio is vetted",
  "Every payment is protected",
];

// Animated background particles
const Particles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-accent/30"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          animate={{
            y: [null, -20, 20],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

// Glitch text effect
const GlitchText = ({ children, className = "" }: { children: string; className?: string }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span 
        className="absolute top-0 left-0 -translate-x-[2px] text-red-500/70 z-0 animate-glitch-1"
        aria-hidden
      >
        {children}
      </span>
      <span 
        className="absolute top-0 left-0 translate-x-[2px] text-cyan-500/70 z-0 animate-glitch-2"
        aria-hidden
      >
        {children}
      </span>
    </span>
  );
};

// Escrow flow visualization
const EscrowFlow = () => {
  const steps = [
    { label: "Funds Held", icon: "💰" },
    { label: "Work Starts", icon: "🔨" },
    { label: "Client Approves", icon: "✅" },
    { label: "Dev Gets Paid", icon: "🎉" },
  ];

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mt-8">
      {steps.map((step, i) => (
        <motion.div
          key={step.label}
          className="flex items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-2/20 border border-accent/30 flex items-center justify-center text-2xl md:text-3xl">
              {step.icon}
            </div>
            <span className="text-xs md:text-sm text-muted-foreground mt-2 text-center">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <motion.div 
              className="mx-2 md:mx-4 text-accent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: i * 0.2 + 0.1 }}
              viewport={{ once: true }}
            >
              →
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default function AdPage() {
  const [currentPainPoint, setCurrentPainPoint] = useState(0);
  const [showChaos, setShowChaos] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  // Cycle through pain points
  useEffect(() => {
    if (!showChaos) return;
    const interval = setInterval(() => {
      setCurrentPainPoint((prev) => {
        if (prev >= painPoints.length - 1) {
          setTimeout(() => setShowChaos(false), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [showChaos]);

  // Reset animation on scroll to top
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      if (value < 0.02) {
        setShowChaos(true);
        setCurrentPainPoint(0);
      }
    });
    return unsubscribe;
  }, [scrollYProgress]);

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Fixed background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-accent/5 pointer-events-none" />
      <Particles />
      
      {/* Hero Section - The Chaos */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div style={{ opacity }} className="text-center">
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-8xl font-display font-bold mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Hiring developers<br />
            <GlitchText className="text-accent">shouldn&apos;t feel like this...</GlitchText>
          </motion.h1>
          
          <AnimatePresence mode="wait">
            {showChaos && (
              <motion.div
                key={currentPainPoint}
                initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 1.2, rotateX: 30 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-4 text-2xl md:text-4xl font-bold text-red-500"
              >
                <span className="text-4xl md:text-6xl">{painPoints[currentPainPoint].icon}</span>
                <span>{painPoints[currentPainPoint].text}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {!showChaos && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8"
              >
                <div className="flex items-center justify-center gap-3 text-3xl md:text-5xl font-bold text-red-500">
                  <XIcon />
                  <span>Yeah... no.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-muted-foreground text-sm">Scroll to discover</span>
          <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full mx-auto mt-2 flex justify-center">
            <motion.div 
              className="w-1.5 h-3 bg-accent rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Meet DevLink */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center"
        >
          <p className="text-muted-foreground text-lg md:text-xl mb-4">Introducing</p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <ThemeLogoImg className="w-16 h-16 md:w-24 md:h-24" />
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-display font-bold bg-gradient-to-r from-accent via-accent-2 to-accent-3 bg-clip-text text-transparent">
              DevLink
            </h2>
          </div>
          <p className="text-xl md:text-3xl text-muted-foreground max-w-3xl mx-auto">
            The platform built for <span className="text-foreground font-semibold">REAL</span> game developers 
            and <span className="text-foreground font-semibold">REAL</span> studios.
          </p>
        </motion.div>
      </section>

      {/* Feature Montage */}
      <section className="min-h-screen px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <motion.h2 
            className="text-3xl md:text-5xl font-display font-bold text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Everything you need.<br />
            <span className="text-accent">All in one place.</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent-2/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-50" />
                <div className="relative bg-card/80 backdrop-blur-xl border border-accent/20 rounded-3xl p-8 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-white mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Search filters visualization */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Need a <span className="text-accent font-semibold">programmer</span>? 
              A <span className="text-accent-2 font-semibold">3D artist</span>? 
              <span className="text-accent-3 font-semibold"> UI, SFX, scripting</span>?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Programmer", "3D Artist", "UI Designer", "SFX", "Animator", "Scripter", "Level Designer"].map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-medium hover:bg-accent hover:text-white transition-colors cursor-pointer"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Escrow Section */}
      <section className="min-h-[70vh] flex items-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold mb-4"
          >
            Found the perfect match?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-muted-foreground mb-8"
          >
            Lock the deal with <span className="text-accent font-semibold">secure escrow payments</span>,<br />
            built-in contracts, and deadlines that <span className="text-foreground font-semibold">actually mean something</span>.
          </motion.p>
          <EscrowFlow />
        </motion.div>
      </section>

      {/* Team Tools */}
      <section className="min-h-screen flex items-center px-4 py-20 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center gap-12"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <UsersIcon />
                <span className="text-accent font-medium">TEAM TOOLS</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
                Want to build a team?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                DevLink gives you everything to operate like a studio from <span className="text-foreground font-semibold">day one</span>.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {teamTools.map((tool, i) => (
                  <motion.div
                    key={tool}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-accent/10"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="font-medium">{tool}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex-1 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent-2/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-xl border border-accent/20 rounded-3xl p-8">
                <div className="aspect-video bg-gradient-to-br from-accent/10 to-accent-2/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <CubeIcon />
                    <p className="mt-4 text-muted-foreground">Team Workspace Preview</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="min-h-[70vh] flex items-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold mb-12"
          >
            Not just a hiring platform—<br />
            <span className="bg-gradient-to-r from-accent via-accent-2 to-accent-3 bg-clip-text text-transparent">
              a full developer ecosystem
            </span>
          </motion.h2>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {marketplace.map((item, i) => (
              <motion.div
                key={item.action}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="px-8 py-6 rounded-2xl bg-card/50 border border-accent/10 hover:border-accent/50 transition-colors">
                  <span className="text-3xl md:text-4xl font-display font-bold text-accent group-hover:text-accent-2 transition-colors">
                    {item.action}
                  </span>
                  <span className="text-xl md:text-2xl text-muted-foreground ml-2">{item.item}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="min-h-screen flex items-center px-4 py-20 bg-gradient-to-b from-transparent via-green-500/5 to-transparent">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
          >
            <ShieldIcon />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold mb-12"
          >
            Trust, Safety, and<br />
            <span className="text-green-500">No More BS</span>
          </motion.h2>
          
          <div className="space-y-6">
            {trustPoints.map((point, i) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-4 text-xl md:text-2xl"
              >
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <CheckIcon />
                </div>
                <span>{point}</span>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-wrap justify-center gap-4 text-xl md:text-2xl font-bold"
          >
            <span className="px-6 py-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/30">
              No scams
            </span>
            <span className="px-6 py-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/30">
              No ghosting
            </span>
            <span className="px-6 py-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/30">
              No drama
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Ending Punchline */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl"
        >
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-muted-foreground mb-8"
          >
            Whether you&apos;re building your first Roblox game,<br />
            scaling a studio, or hiring your next lead developer—
          </motion.p>
          
          <motion.h2
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-12"
          >
            DevLink makes it<br />
            <span className="bg-gradient-to-r from-accent via-accent-2 to-accent-3 bg-clip-text text-transparent">
              effortless
            </span>
          </motion.h2>
        </motion.div>
      </section>

      {/* Logo Reveal + CTA */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative">
        {/* Glow effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-gradient-to-r from-accent/30 via-accent-2/20 to-accent-3/30 rounded-full blur-[100px] opacity-50" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative text-center"
        >
          <ThemeLogoImg className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-8" />
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold bg-gradient-to-r from-accent via-accent-2 to-accent-3 bg-clip-text text-transparent mb-6">
            DevLink
          </h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-muted-foreground mb-4"
          >
            Your team. Your tools. Your future.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-display font-bold mb-12"
          >
            All in one place.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="group relative px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent-2 to-accent-3" />
              <div className="absolute inset-0 bg-gradient-to-r from-accent-2 via-accent-3 to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-white flex items-center gap-2">
                Get Started <RocketIcon />
              </span>
            </Link>
            
            <Link
              href="/home"
              className="px-8 py-4 rounded-2xl font-bold text-lg border border-accent/30 hover:border-accent hover:bg-accent/10 transition-colors"
            >
              Explore DevLink
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
          className="absolute bottom-8 text-center"
        >
          <p className="text-2xl md:text-4xl font-display font-bold bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            Build Together.
          </p>
        </motion.div>
      </section>

      {/* Custom styles */}
      <style jsx global>{`
        @keyframes glitch-1 {
          0%, 100% { transform: translateX(-2px); opacity: 0.7; }
          20% { transform: translateX(2px); opacity: 0.5; }
          40% { transform: translateX(-1px); opacity: 0.8; }
          60% { transform: translateX(1px); opacity: 0.6; }
          80% { transform: translateX(-2px); opacity: 0.7; }
        }
        
        @keyframes glitch-2 {
          0%, 100% { transform: translateX(2px); opacity: 0.7; }
          20% { transform: translateX(-2px); opacity: 0.6; }
          40% { transform: translateX(1px); opacity: 0.5; }
          60% { transform: translateX(-1px); opacity: 0.8; }
          80% { transform: translateX(2px); opacity: 0.6; }
        }
        
        .animate-glitch-1 {
          animation: glitch-1 0.3s ease-in-out infinite;
        }
        
        .animate-glitch-2 {
          animation: glitch-2 0.3s ease-in-out infinite reverse;
        }
      `}</style>
    </div>
  );
}

