"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Script & Timing Configuration ---
// Total Target: ~62s (1:02)

const SCENES = [
  // 0: Chaos - Intro
  // "Hiring developers shouldn’t feel like this."
  { id: 'intro', duration: 4000, type: 'kinetic_slam', text: ['HIRING', 'SHOULDN’T', 'HURT'], bg: '#000000' },
  
  // 1: Pain Points - Rapid Fire
  // "Random Discord DMs? Scams? Ghosted? Late? Nope."
  { id: 'pain_1', duration: 1500, type: 'flash_word', text: 'SCAMS?', bg: '#1a0000', accent: '#ff0000' },
  { id: 'pain_2', duration: 1500, type: 'flash_word', text: 'GHOSTED?', bg: '#1a0000', accent: '#ff0000' },
  { id: 'pain_3', duration: 1500, type: 'flash_word', text: 'LATE?', bg: '#1a0000', accent: '#ff0000' },
  { id: 'pain_4', duration: 2000, type: 'flash_word', text: 'NOPE.', bg: '#000000', accent: '#ffffff' },

  // 2: The Solution - Smooth
  // "Meet DevLink. The real network."
  { id: 'meet', duration: 4000, type: 'hero_smooth', text: 'MEET DEVLINK', sub: 'THE REAL NETWORK', bg: '#050508' },

  // 3: Features - 3D Cards
  // "Verified portfolios. Real history. Rated skills. Proof of work. All in one place."
  { id: 'feat_1', duration: 2500, type: 'card_3d', text: 'VERIFIED', icon: '✅' },
  { id: 'feat_2', duration: 2500, type: 'card_3d', text: 'HISTORY', icon: '📂' },
  { id: 'feat_3', duration: 2500, type: 'card_3d', text: 'RATED', icon: '⭐' },
  
  // 4: Search - Zoom
  // "Need a pro? Programmer. Artist. SFX. Find them instantly."
  { id: 'search', duration: 4500, type: 'zoom_tunnel', text: 'FIND PROS', sub: 'PROGRAMMERS • ARTISTS • SFX' },

  // 5: Escrow - Secure
  // "Found the perfect match? Lock it in. Secure escrow. Funds held. Work done. Paid."
  { id: 'escrow', duration: 6000, type: 'lock_in', text: 'SECURE ESCROW', sub: 'FUNDS HELD • WORK DONE • PAID' },

  // 6: Team - Grid
  // "Want to build a studio? Team hubs. Task boards. Project chats. Build your dream team."
  { id: 'team', duration: 6000, type: 'grid_build', text: 'BUILD YOUR STUDIO' },

  // 7: Ecosystem - Fast Words
  // "Sell assets. License code. Offer services. Get hired."
  { id: 'eco_1', duration: 1200, type: 'big_word', text: 'SELL' },
  { id: 'eco_2', duration: 1200, type: 'big_word', text: 'LICENSE' },
  { id: 'eco_3', duration: 1200, type: 'big_word', text: 'HIRE' },
  
  // "It’s a full developer ecosystem."
  { id: 'eco_4', duration: 3500, type: 'logo_burst', text: 'FULL ECOSYSTEM' },

  // 8: Trust - Stamps
  // "Every dev verified. Every studio vetted. Every payment protected. No BS."
  { id: 'trust', duration: 5000, type: 'stamp_check', text: 'NO BS.' },

  // 9: Finale
  // "Whether you're building your first game or scaling a studio... DevLink makes it effortless."
  { id: 'effortless', duration: 4000, type: 'hero_smooth', text: 'EFFORTLESS', sub: 'SCALING FOR STUDIOS', bg: '#050508' },

  // "DevLink. Build Together."
  { id: 'end', duration: 8000, type: 'final_logo', text: 'DEVLINK' }
];

const TOTAL_DURATION_MS = SCENES.reduce((acc, s) => acc + s.duration, 0);

export default function AdPage() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // --- Engine: Audio-Driven Sync ---
  // This is the "Video Game" loop. It doesn't rely on React state for timing.
  // It checks the audio timestamp every frame.
  
  const animate = () => {
    let currentTime = 0;

    if (audioRef.current && !audioRef.current.paused) {
      // Sync to Audio Time (Precision)
      currentTime = audioRef.current.currentTime * 1000;
    } else {
      // Fallback: System Clock Time
      currentTime = Date.now() - startTimeRef.current;
    }

    // Loop
    if (currentTime >= TOTAL_DURATION_MS) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      startTimeRef.current = Date.now();
      currentTime = 0;
    }

    // Calculate Scene
    let acc = 0;
    let foundIndex = 0;
    for (let i = 0; i < SCENES.length; i++) {
      acc += SCENES[i].duration;
      if (currentTime < acc) {
        foundIndex = i;
        break;
      }
    }

    // Only update React state if scene changed (Performance)
    setSceneIndex(prev => {
      if (prev !== foundIndex) return foundIndex;
      return prev;
    });

    setProgress(currentTime / TOTAL_DURATION_MS);
    requestRef.current = requestAnimationFrame(animate);
  };

  const startExperience = () => {
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    
    // Explicit play call inside user gesture
    if (audioRef.current) {
      audioRef.current.volume = 1.0; // Ensure full volume
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio playback failed:", error);
          // Fallback UI or logic could go here
        });
      }
    }
    
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // --- Render ---

  if (!isPlaying) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer z-50" onClick={startExperience}>
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center mx-auto mb-8"
          >
            <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[30px] border-l-white border-b-[15px] border-b-transparent ml-2" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-widest">START EXPERIENCE</h1>
          <p className="text-gray-500 mt-4 font-mono text-sm">SOUND ON • FULLSCREEN</p>
        </div>
      </div>
    );
  }

  const scene = SCENES[sceneIndex];

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden font-sans select-none">
      {/* Audio Source - Auto-syncs if file exists */}
      <audio ref={audioRef} src="/ad-voice.mp3" preload="auto" />

      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 transition-colors duration-300 ease-linear"
        style={{ backgroundColor: scene.bg }}
      />
      
      {/* Noise Grain Overlay (Cinematic feel) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Scene Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }} // Fast cuts
        >
          <SceneRenderer scene={scene} />
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
        <div 
          className="h-full bg-white transition-all duration-75 ease-linear" 
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      
      {/* Debug/Info */}
      <div className="absolute bottom-4 right-4 text-xs font-mono text-white/30">
        DEVLINK AD • {scene.id.toUpperCase()}
      </div>

      {/* Unmute Fallback */}
      <button 
        onClick={() => audioRef.current && (audioRef.current.muted = false)}
        className="absolute top-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity bg-white/10 p-2 rounded-full"
        title="Unmute"
      >
        🔊
      </button>
    </div>
  );
}

// --- High-Performance Renderers ---

function SceneRenderer({ scene }: { scene: any }) {
  switch (scene.type) {
    case 'kinetic_slam':
      return (
        <div className="flex flex-col items-center gap-2">
          {scene.text.map((line: string, i: number) => (
            <motion.h1
              key={line}
              initial={{ y: 100, opacity: 0, rotateX: 90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              className="text-7xl md:text-9xl font-black tracking-tighter leading-none"
            >
              {line}
            </motion.h1>
          ))}
        </div>
      );
      
    case 'flash_word':
      return (
        <motion.div 
          className="flex flex-col items-center justify-center w-full h-full"
          style={{ backgroundColor: scene.accent ? scene.bg : undefined }}
        >
          <motion.h1 
            initial={{ scale: 2, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            className="text-[12vw] font-black uppercase text-center leading-none"
            style={{ color: scene.accent || 'white' }}
          >
            {scene.text}
          </motion.h1>
        </motion.div>
      );

    case 'hero_smooth':
      return (
        <div className="text-center z-10">
          <motion.h1 
            initial={{ letterSpacing: "-0.1em", opacity: 0 }}
            animate={{ letterSpacing: "0em", opacity: 1 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="text-[10vw] font-black bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent"
          >
            {scene.text}
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="h-1 bg-white/20 mx-auto mt-4"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-2xl md:text-4xl mt-6 font-mono tracking-widest text-gray-400"
          >
            {scene.sub}
          </motion.p>
        </div>
      );

    case 'card_3d':
      return (
        <motion.div 
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-white/5 border border-white/10 p-16 rounded-3xl backdrop-blur-lg flex flex-col items-center justify-center min-w-[300px]"
        >
          <span className="text-8xl mb-8">{scene.icon}</span>
          <h2 className="text-5xl font-bold tracking-tight">{scene.text}</h2>
        </motion.div>
      );

    case 'zoom_tunnel':
      return (
        <div className="text-center">
          <motion.div
            className="absolute inset-0 border-[20px] border-white/5 rounded-full"
            animate={{ scale: [1, 2], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
           <motion.h1 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-black mb-4 relative z-10"
          >
            {scene.text}
          </motion.h1>
          <p className="text-3xl text-purple-400 font-bold">{scene.sub}</p>
        </div>
      );
      
    case 'lock_in':
      return (
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 2 }}
            animate={{ scale: 1 }}
            className="text-9xl mb-8"
          >
            🔒
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black">{scene.text}</h1>
          <motion.div 
            className="flex gap-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {scene.sub.split('•').map((s: string) => (
              <span key={s} className="bg-white/10 px-4 py-2 rounded text-sm font-mono">{s}</span>
            ))}
          </motion.div>
        </div>
      );
      
    case 'grid_build':
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
            {scene.text}
          </motion.h2>
        </div>
      );

    case 'big_word':
      return (
        <motion.h1
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="text-[15vw] font-black italic uppercase"
        >
          {scene.text}
        </motion.h1>
      );
      
    case 'logo_burst':
      return (
        <div className="relative">
          <motion.div 
            className="absolute inset-0 bg-purple-500 blur-[150px] opacity-30"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <h1 className="text-7xl md:text-9xl font-black text-center relative z-10 leading-none">
            {scene.text}
          </h1>
        </div>
      );
      
    case 'stamp_check':
      return (
        <motion.div 
          initial={{ scale: 5, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: -5, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="border-8 border-white p-8 md:p-12"
        >
          <h1 className="text-8xl md:text-[12rem] font-black leading-none">{scene.text}</h1>
        </motion.div>
      );
      
    case 'final_logo':
      return (
        <div className="flex flex-col items-center">
           <motion.h1 
            initial={{ letterSpacing: "0.5em", opacity: 0 }}
            animate={{ letterSpacing: "0em", opacity: 1 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="text-[12vw] font-black bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent"
          >
            {scene.text}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-2xl tracking-[1em] mt-4"
          >
            BUILD TOGETHER
          </motion.p>
        </div>
      );

    default:
      return null;
  }
}
