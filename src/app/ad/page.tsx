"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

// --- Configuration ---

const SCENES = [
  // 1. Chaos Intro - AGGRESSIVE
  { id: 'chaos_intro', duration: 2500, type: 'text_slam', text: 'HIRING DEVS\nSHOULDN’T FEEL\nLIKE THIS...', bg: 'bg-[#1a0505]' },
  
  // 2. Chaos Flash - FAST CUTS
  { id: 'chaos_1', duration: 600, type: 'flash_cut', text: 'RANDOM DMs?', sub: '🚫 SCAM ALERT', bg: 'bg-[#2a0505]' },
  { id: 'chaos_2', duration: 600, type: 'flash_cut', text: 'UNVERIFIED?', sub: '❓ WHO ARE YOU?', bg: 'bg-[#3a0505]' },
  { id: 'chaos_3', duration: 600, type: 'flash_cut', text: 'MISSED DEADLINES?', sub: '⏰ LATE AGAIN', bg: 'bg-[#2a0505]' },
  { id: 'chaos_4', duration: 600, type: 'flash_cut', text: 'NO PROTECTION?', sub: '💸 MONEY GONE', bg: 'bg-[#1a0505]' },
  
  // 3. The Wipe - CLEANSE
  { id: 'nope', duration: 1500, type: 'big_nope', text: 'YEAH... NO.', bg: 'bg-black' },
  
  // 4. Hero Reveal - EPIC
  { id: 'meet', duration: 3000, type: 'hero_reveal', text: 'MEET DEVLINK', sub: 'BUILT FOR REAL STUDIOS', bg: 'bg-[#050508]' },
  
  // 5. Feature Montage - SLEEK 3D
  { id: 'feat_1', duration: 1000, type: 'feature_3d', text: 'VERIFIED PORTFOLIOS', icon: '✅' },
  { id: 'feat_2', duration: 1000, type: 'feature_3d', text: 'REAL HISTORY', icon: '📂' },
  { id: 'feat_3', duration: 1000, type: 'feature_3d', text: 'SKILLS & RATINGS', icon: '⭐' },
  { id: 'feat_4', duration: 1500, type: 'feature_3d', text: 'PROOF OF WORK', icon: '💼', sub: 'ALL IN ONE PLACE' },
  
  // 6. Search - HIGH TECH
  { id: 'search_1', duration: 2000, type: 'search_zoom', text: 'NEED A PRO?', sub: 'PROGRAMMER? ARTIST? SFX?' },
  { id: 'search_2', duration: 2000, type: 'search_ui', text: 'PRECISE FILTERS', sub: 'SEARCH THOUSANDS' },
  
  // 7. Escrow - SECURE
  { id: 'escrow', duration: 4000, type: 'escrow_flow', text: 'SECURE ESCROW' },
  
  // 8. Team - COLLABORATIVE
  { id: 'team', duration: 4000, type: 'team_grid', text: 'OPERATE LIKE A STUDIO' },
  
  // 9. Ecosystem - KINETIC
  { id: 'market_1', duration: 500, type: 'kinetic_word', text: 'SELL' },
  { id: 'market_2', duration: 500, type: 'kinetic_word', text: 'LICENSE' },
  { id: 'market_3', duration: 500, type: 'kinetic_word', text: 'OFFER' },
  { id: 'market_4', duration: 500, type: 'kinetic_word', text: 'HIRE' },
  { id: 'market_5', duration: 2000, type: 'ecosystem_reveal', text: 'FULL DEVELOPER ECOSYSTEM' },
  
  // 10. Trust - IMPACT
  { id: 'trust', duration: 3000, type: 'stamp_sequence', text: 'NO BS' },
  
  // 11. Punchline
  { id: 'punchline', duration: 3000, type: 'text_elegant', text: 'EFFORTLESS', sub: 'SCALING FOR STUDIOS' },
  
  // 12. Finale
  { id: 'finale', duration: 5000, type: 'logo_finish', text: 'DEVLINK', sub: 'BUILD TOGETHER' }
];

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0);

// --- Main Component ---

export default function AdPage() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let active = true;
    let startTime = Date.now();
    let currentSceneIdx = 0;
    
    const loop = () => {
      if (!active) return;
      const now = Date.now();
      const elapsed = (now - startTime) % TOTAL_DURATION;
      setProgress(elapsed / TOTAL_DURATION);
      
      let acc = 0;
      let nextSceneIdx = 0;
      for (let i = 0; i < SCENES.length; i++) {
        acc += SCENES[i].duration;
        if (elapsed < acc) {
          nextSceneIdx = i;
          break;
        }
      }
      
      if (nextSceneIdx !== currentSceneIdx) {
        currentSceneIdx = nextSceneIdx;
        setSceneIndex(nextSceneIdx);
      }
      
      requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
    return () => { active = false; };
  }, []);

  const scene = SCENES[sceneIndex];

  return (
    <div className={`fixed inset-0 overflow-hidden ${scene.bg || 'bg-[#050508]'} text-white font-sans transition-colors duration-200 perspective-1000`}>
      {/* Dynamic Background */}
      <BackgroundEffects type={scene.type} />

      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10"
          initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          transition={{ duration: 0.2 }}
        >
          <SceneContent scene={scene} />
        </motion.div>
      </AnimatePresence>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-white/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow-[0_0_20px_rgba(168,85,247,0.8)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40 z-40" />
    </div>
  );
}

// --- Background Effects ---

function BackgroundEffects({ type }: { type: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {type.includes('chaos') && (
        <>
          <div className="absolute inset-0 opacity-20 animate-noise bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJnoiPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2cpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]" />
          <motion.div 
            className="absolute inset-0 bg-red-500/10 mix-blend-overlay"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.1, repeat: Infinity }}
          />
        </>
      )}
      
      {!type.includes('chaos') && (
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.1),transparent_70%)]" />
          <div className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <FloatingParticles />
        </div>
      )}
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) 
          }}
          animate={{ 
            y: [null, -100], 
            opacity: [0, 1, 0] 
          }}
          transition={{ 
            duration: 2 + Math.random() * 3, 
            repeat: Infinity,
            delay: Math.random() * 2 
          }}
        />
      ))}
    </div>
  );
}

// --- Scene Router ---

function SceneContent({ scene }: { scene: any }) {
  switch (scene.type) {
    case 'text_slam': return <TextSlam text={scene.text} />;
    case 'flash_cut': return <FlashCut text={scene.text} sub={scene.sub} />;
    case 'big_nope': return <BigNope text={scene.text} />;
    case 'hero_reveal': return <HeroReveal text={scene.text} sub={scene.sub} />;
    case 'feature_3d': return <Feature3D text={scene.text} icon={scene.icon} sub={scene.sub} />;
    case 'search_zoom': return <SearchZoom text={scene.text} sub={scene.sub} />;
    case 'search_ui': return <SearchUI text={scene.text} sub={scene.sub} />;
    case 'escrow_flow': return <EscrowFlow />;
    case 'team_grid': return <TeamGrid text={scene.text} />;
    case 'kinetic_word': return <KineticWord text={scene.text} />;
    case 'ecosystem_reveal': return <EcosystemReveal text={scene.text} />;
    case 'stamp_sequence': return <StampSequence />;
    case 'text_elegant': return <TextElegant text={scene.text} sub={scene.sub} />;
    case 'logo_finish': return <LogoFinish />;
    default: return null;
  }
}

// --- Scene Components ---

function TextSlam({ text }: { text: string }) {
  return (
    <div className="relative">
      <motion.h1 
        className="text-6xl md:text-9xl font-black text-center leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400"
        initial={{ scale: 3, rotateZ: 10, opacity: 0 }}
        animate={{ scale: 1, rotateZ: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {text}
      </motion.h1>
      <motion.div 
        className="absolute -inset-4 border-4 border-red-500/50"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: [0, 1, 0] }}
        transition={{ duration: 0.2, repeat: 5 }}
      />
    </div>
  );
}

function FlashCut({ text, sub }: { text: string, sub: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.h2 
        className="text-5xl md:text-8xl font-black text-red-500 mb-4 glitch-text"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        {text}
      </motion.h2>
      <motion.div 
        className="bg-red-600 text-black font-black text-3xl md:text-5xl px-8 py-2 transform -rotate-3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        {sub}
      </motion.div>
    </div>
  );
}

function BigNope({ text }: { text: string }) {
  return (
    <div className="relative">
      <motion.div
        className="text-[20rem] leading-none text-white/5 font-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
      >
        ✕
      </motion.div>
      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="text-7xl md:text-9xl font-black text-white relative z-10"
      >
        {text}
      </motion.h1>
    </div>
  );
}

function HeroReveal({ text, sub }: { text: string, sub: string }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
      >
        <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent leading-none">
          {text}
        </h1>
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-4"
      />
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-3xl md:text-5xl mt-8 text-gray-300 font-light tracking-wide"
      >
        {sub}
      </motion.p>
    </div>
  );
}

function Feature3D({ text, icon, sub }: { text: string, icon: string, sub?: string }) {
  return (
    <div className="perspective-1000">
      <motion.div
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-12 rounded-3xl shadow-2xl flex flex-col items-center"
      >
        <span className="text-8xl mb-6 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{icon}</span>
        <h2 className="text-5xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
          {text}
        </h2>
        {sub && (
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl mt-4 text-purple-400 font-bold tracking-widest uppercase"
          >
            {sub}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function SearchZoom({ text, sub }: { text: string, sub: string }) {
  return (
    <div className="text-center relative">
      <motion.div
        className="absolute inset-0 bg-purple-500/20 blur-[100px] -z-10"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.h2 
        className="text-7xl md:text-9xl font-black mb-6"
        initial={{ scale: 3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {text}
      </motion.h2>
      <motion.p className="text-3xl md:text-4xl text-gray-400 font-mono">
        {sub}
      </motion.p>
    </div>
  );
}

function SearchUI({ text, sub }: { text: string, sub: string }) {
  const tags = ["React", "UE5", "Unity", "Node.js", "Blender", "Maya", "C#", "C++", "Python", "Rust"];
  return (
    <div className="w-full max-w-6xl text-center">
      <motion.h2 
        className="text-6xl md:text-8xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
      >
        {text}
      </motion.h2>
      <div className="flex flex-wrap justify-center gap-4">
        {tags.map((tag, i) => (
          <motion.div
            key={tag}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 px-8 py-4 rounded-full text-2xl font-bold backdrop-blur-md"
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            {tag}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EscrowFlow() {
  const steps = [
    { label: "FUNDS HELD", icon: "🔒" },
    { label: "WORK STARTS", icon: "🛠️" },
    { label: "APPROVE", icon: "👍" },
    { label: "PAID", icon: "💸" }
  ];
  return (
    <div className="w-full max-w-7xl px-4 text-center">
      <motion.h2 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-black mb-20"
      >
        SECURE ESCROW
      </motion.h2>
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -z-10" />
        <motion.div 
          className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "linear" }}
        />
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.8 }}
            className="flex flex-col items-center bg-[#050508] p-4 rounded-xl border border-white/10"
          >
            <div className="text-6xl mb-4">{step.icon}</div>
            <div className="text-2xl font-black">{step.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TeamGrid({ text }: { text: string }) {
  return (
    <div className="text-center w-full max-w-5xl">
      <div className="grid grid-cols-2 gap-8 mb-16 perspective-1000">
        {[
          { t: "HUBS", c: "bg-blue-500/20" },
          { t: "TASKS", c: "bg-purple-500/20" },
          { t: "CHAT", c: "bg-pink-500/20" },
          { t: "GIT", c: "bg-orange-500/20" }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: i * 0.2, type: "spring" }}
            className={`${item.c} h-40 rounded-2xl border border-white/10 flex items-center justify-center`}
          >
            <span className="text-4xl font-black">{item.t}</span>
          </motion.div>
        ))}
      </div>
      <motion.h2 
        initial={{ opacity: 0, scale: 2 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-5xl md:text-7xl font-black"
      >
        {text}
      </motion.h2>
    </div>
  );
}

function KineticWord({ text }: { text: string }) {
  return (
    <motion.h1
      key={text}
      initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
      animate={{ scale: 1, opacity: 1, rotateX: 0 }}
      exit={{ scale: 1.5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="text-8xl md:text-[12rem] font-black uppercase text-transparent bg-clip-text bg-gradient-to-t from-gray-500 to-white"
    >
      {text}
    </motion.h1>
  );
}

function EcosystemReveal({ text }: { text: string }) {
  return (
    <div className="text-center">
      <div className="relative">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-[100px] opacity-30"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <h2 className="text-6xl md:text-9xl font-black leading-tight relative z-10">
          {text.split(' ').map((word, i) => (
            <motion.div 
              key={i} 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.2, type: "spring" }}
            >
              {word}
            </motion.div>
          ))}
        </h2>
      </div>
    </div>
  );
}

function StampSequence() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center">
      {["NO SCAMS", "NO GHOSTING", "NO DRAMA"].map((item, i) => (
        <motion.div
          key={i}
          initial={{ scale: 5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.6, type: "spring", stiffness: 300, damping: 20 }}
          className="text-6xl md:text-8xl font-black text-white bg-red-600 px-12 py-4 transform -skew-x-12 shadow-[10px_10px_0px_rgba(0,0,0,0.5)]"
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}

function TextElegant({ text, sub }: { text: string, sub: string }) {
  return (
    <div className="text-center">
      <motion.h1
        initial={{ letterSpacing: "1em", opacity: 0 }}
        animate={{ letterSpacing: "0.1em", opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-8xl font-black uppercase"
      >
        {text}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-3xl md:text-5xl mt-8 text-purple-400 font-light"
      >
        {sub}
      </motion.p>
    </div>
  );
}

function LogoFinish() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-[150px] opacity-40"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.h1
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-8xl md:text-[15rem] font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400"
      >
        DEVLINK
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-4xl md:text-6xl font-light tracking-[1em] mt-8 text-white"
      >
        BUILD TOGETHER
      </motion.p>
    </div>
  );
}
