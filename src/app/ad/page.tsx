"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// --- Configuration & Script Timing ---

const SCENES = [
  // 1. Chaos Intro
  { id: 'chaos_intro', duration: 2500, type: 'text_slam', text: 'Hiring developers\nshouldn’t feel like this…', bg: 'bg-red-950' },
  
  // 2. Chaos Flash (Fast cuts)
  { id: 'chaos_1', duration: 800, type: 'flash_cut', text: 'Random Discord DMs?', sub: '🚫 SCAM?', bg: 'bg-red-900' },
  { id: 'chaos_2', duration: 800, type: 'flash_cut', text: 'Unverified Work?', sub: '❓ WHO IS THIS?', bg: 'bg-red-950' },
  { id: 'chaos_3', duration: 800, type: 'flash_cut', text: 'Missed Deadlines?', sub: '⏰ LATE AGAIN', bg: 'bg-red-900' },
  { id: 'chaos_4', duration: 800, type: 'flash_cut', text: 'No Protection?', sub: '💸 MONEY GONE', bg: 'bg-red-950' },
  
  // 3. The Wipe (Beat)
  { id: 'nope', duration: 1500, type: 'big_nope', text: 'Yeah… no.', bg: 'bg-black' },
  
  // 4. Meet DevLink
  { id: 'meet', duration: 3000, type: 'hero_reveal', text: 'Meet DevLink', sub: 'Built for REAL Game Developers.', bg: 'bg-[#050508]' },
  
  // 5. Feature Montage (Fast, clean)
  { id: 'feat_1', duration: 1000, type: 'feature_slide', text: 'Verified Portfolios', icon: '✅' },
  { id: 'feat_2', duration: 1000, type: 'feature_slide', text: 'Real Project History', icon: '📂' },
  { id: 'feat_3', duration: 1000, type: 'feature_slide', text: 'Skills & Ratings', icon: '⭐' },
  { id: 'feat_4', duration: 1500, type: 'feature_slide', text: 'Proof of Work', icon: '💼', sub: 'All in one place.' },
  
  // 6. Search (Zooming)
  { id: 'search_1', duration: 2000, type: 'search_zoom', text: 'Need a Programmer?', sub: 'Or a 3D Artist? UI? SFX?' },
  { id: 'search_2', duration: 2000, type: 'search_ui', text: 'Hyper-Precise Filters', sub: 'Search thousands of devs.' },
  
  // 7. Escrow
  { id: 'escrow_1', duration: 1500, type: 'text_center', text: 'Found the perfect match?', bg: 'bg-[#050508]' },
  { id: 'escrow_2', duration: 3500, type: 'escrow_flow', text: 'Secure Escrow Payments' },
  
  // 8. Team Tools
  { id: 'team_intro', duration: 1500, type: 'text_center', text: 'Want to build a team?', bg: 'bg-[#0b0b15]' },
  { id: 'team_grid', duration: 3000, type: 'team_grid', text: 'Operate like a studio.' },
  
  // 9. Marketplace
  { id: 'market_1', duration: 600, type: 'kinetic_word', text: 'Sell Assets' },
  { id: 'market_2', duration: 600, type: 'kinetic_word', text: 'License Code' },
  { id: 'market_3', duration: 600, type: 'kinetic_word', text: 'Offer Services' },
  { id: 'market_4', duration: 600, type: 'kinetic_word', text: 'Get Hired' },
  { id: 'market_5', duration: 2000, type: 'ecosystem_reveal', text: 'A Full Developer Ecosystem' },
  
  // 10. Trust (No BS)
  { id: 'trust_1', duration: 1000, type: 'check_list', text: 'Every dev verified.' },
  { id: 'trust_2', duration: 1000, type: 'check_list', text: 'Every studio vetted.' },
  { id: 'trust_3', duration: 1000, type: 'check_list', text: 'Payments protected.' },
  { id: 'trust_4', duration: 2500, type: 'stamp_sequence', text: 'NO BS.' },
  
  // 11. Punchline
  { id: 'punchline', duration: 3500, type: 'text_elegant', text: 'DevLink makes it effortless.', sub: 'For studios & freelancers.' },
  
  // 12. Finale
  { id: 'finale', duration: 5000, type: 'logo_finish', text: 'DevLink', sub: 'Build Together.' }
];

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0);

// --- Components ---

export default function AdPage() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let active = true;
    let startTime = Date.now();
    let currentSceneIdx = 0;
    
    // Scene loop
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
    <div className={`fixed inset-0 overflow-hidden ${scene.bg || 'bg-[#050508]'} text-white font-sans transition-colors duration-300`}>
      {/* Global animated background (subtle) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          className="absolute inset-0 flex flex-col items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }} // Fast cuts
        >
          {scene.type === 'text_slam' && <TextSlam text={scene.text!} />}
          {scene.type === 'flash_cut' && <FlashCut text={scene.text!} sub={scene.sub!} />}
          {scene.type === 'big_nope' && <BigNope text={scene.text!} />}
          {scene.type === 'hero_reveal' && <HeroReveal text={scene.text!} sub={scene.sub!} />}
          {scene.type === 'feature_slide' && <FeatureSlide text={scene.text!} icon={scene.icon!} sub={scene.sub} />}
          {scene.type === 'search_zoom' && <SearchZoom text={scene.text!} sub={scene.sub!} />}
          {scene.type === 'search_ui' && <SearchUI text={scene.text!} sub={scene.sub!} />}
          {scene.type === 'text_center' && <TextCenter text={scene.text!} />}
          {scene.type === 'escrow_flow' && <EscrowFlow />}
          {scene.type === 'team_grid' && <TeamGrid text={scene.text!} />}
          {scene.type === 'kinetic_word' && <KineticWord text={scene.text!} />}
          {scene.type === 'ecosystem_reveal' && <EcosystemReveal text={scene.text!} />}
          {scene.type === 'check_list' && <CheckList text={scene.text!} />}
          {scene.type === 'stamp_sequence' && <StampSequence />}
          {scene.type === 'text_elegant' && <TextElegant text={scene.text!} sub={scene.sub!} />}
          {scene.type === 'logo_finish' && <LogoFinish />}
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
        <div 
          className="h-full bg-purple-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

// --- Scene Components ---

function TextSlam({ text }: { text: string }) {
  return (
    <motion.h1 
      className="text-5xl md:text-8xl font-black text-center leading-tight uppercase tracking-tighter"
      initial={{ scale: 2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {text.split('\n').map((line, i) => (
        <div key={i} className="block">{line}</div>
      ))}
    </motion.h1>
  );
}

function FlashCut({ text, sub }: { text: string, sub: string }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-red-950/50">
      <motion.div 
        className="absolute inset-0 bg-red-600 mix-blend-overlay opacity-20"
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.2, repeat: Infinity }}
      />
      <motion.h2 
        className="text-4xl md:text-7xl font-bold text-red-500 mb-4"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {text}
      </motion.h2>
      <motion.div 
        className="bg-red-600 text-black font-black text-2xl md:text-4xl px-4 py-2 transform -rotate-6"
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
    <div className="flex flex-col items-center justify-center h-full w-full bg-black">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.4 }}
        className="text-[15rem] leading-none text-white font-black"
      >
        ✕
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-6xl md:text-8xl font-bold mt-8"
      >
        {text}
      </motion.h1>
    </div>
  );
}

function HeroReveal({ text, sub }: { text: string, sub: string }) {
  return (
    <div className="text-center z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
          {text}
        </h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl md:text-4xl mt-6 text-gray-300 font-light"
      >
        {sub}
      </motion.p>
    </div>
  );
}

function FeatureSlide({ text, icon, sub }: { text: string, icon: string, sub?: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ x: 1000 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="flex items-center gap-8"
      >
        <span className="text-8xl">{icon}</span>
        <h2 className="text-5xl md:text-7xl font-bold">{text}</h2>
      </motion.div>
      {sub && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl mt-8 text-purple-400"
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}

function SearchZoom({ text, sub }: { text: string, sub: string }) {
  return (
    <motion.div 
      className="text-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-6xl md:text-8xl font-bold mb-4">{text}</h2>
      <p className="text-3xl text-gray-400">{sub}</p>
    </motion.div>
  );
}

function SearchUI({ text, sub }: { text: string, sub: string }) {
  const tags = ["React", "Unreal Engine 5", "Blender", "Node.js", "Sound Design", "C++", "Lua"];
  return (
    <div className="relative w-full max-w-4xl mx-auto text-center">
      <motion.h2 
        className="text-5xl md:text-7xl font-bold mb-12 text-purple-400"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {text}
      </motion.h2>
      
      <div className="flex flex-wrap justify-center gap-4">
        {tags.map((tag, i) => (
          <motion.div
            key={tag}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/10 border border-white/20 px-6 py-3 rounded-full text-xl md:text-2xl"
          >
            {tag}
          </motion.div>
        ))}
      </div>
      
      <motion.p
        className="mt-12 text-2xl text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {sub}
      </motion.p>
    </div>
  );
}

function TextCenter({ text }: { text: string }) {
  return (
    <motion.h2
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-5xl md:text-7xl font-bold text-center"
    >
      {text}
    </motion.h2>
  );
}

function EscrowFlow() {
  const steps = ["Funds Held", "Work Starts", "Client Approves", "Dev Gets Paid"];
  return (
    <div className="w-full max-w-6xl px-4">
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl md:text-6xl font-bold text-center mb-16"
      >
        Secure Escrow Pipeline
      </motion.h2>
      
      <div className="flex justify-between items-center relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-800 -z-10">
          <motion.div 
            className="h-full bg-green-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.5 }}
            className="flex flex-col items-center bg-[#050508] p-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-2xl mb-4">
              {i + 1}
            </div>
            <span className="text-xl md:text-2xl font-bold whitespace-nowrap">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TeamGrid({ text }: { text: string }) {
  const tools = [
    { name: "Team Hubs", icon: "🏢" },
    { name: "Task Boards", icon: "📋" },
    { name: "Chat", icon: "💬" },
    { name: "Version Control", icon: "🔄" },
  ];

  return (
    <div className="text-center">
      <div className="grid grid-cols-2 gap-8 mb-12">
        {tools.map((tool, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white/5 p-8 rounded-2xl border border-white/10"
          >
            <div className="text-6xl mb-4">{tool.icon}</div>
            <div className="text-2xl font-bold">{tool.name}</div>
          </motion.div>
        ))}
      </div>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
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
      initial={{ scale: 3, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0, rotate: 10 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="text-6xl md:text-9xl font-black uppercase text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500"
    >
      {text}
    </motion.h1>
  );
}

function EcosystemReveal({ text }: { text: string }) {
  return (
    <motion.div 
      className="relative z-10 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-purple-500 blur-[100px] opacity-20 -z-10" />
      <h2 className="text-5xl md:text-8xl font-black leading-tight">
        {text.split(' ').map((word, i) => (
          <motion.span 
            key={i} 
            className="inline-block mx-2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
          >
            {word}
          </motion.span>
        ))}
      </h2>
    </motion.div>
  );
}

function CheckList({ text }: { text: string }) {
  return (
    <motion.div 
      className="flex items-center gap-6"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-black text-3xl font-bold">✓</div>
      <span className="text-4xl md:text-6xl font-bold">{text}</span>
    </motion.div>
  );
}

function StampSequence() {
  const items = ["NO SCAMS", "NO GHOSTING", "NO DRAMA"];
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-full">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.5, type: "spring", bounce: 0.5 }}
          className="text-6xl md:text-8xl font-black text-red-500 border-4 border-red-500 px-8 py-2 transform -rotate-6"
          style={{ rotate: `${(i % 2 === 0 ? -1 : 1) * 6}deg` }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}

function TextElegant({ text, sub }: { text: string, sub: string }) {
  return (
    <div className="text-center px-4">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl text-gray-400 mb-8"
      >
        Whether you&apos;re building your first game or scaling a studio...
      </motion.p>
      <motion.h1
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-5xl md:text-8xl font-bold leading-tight"
      >
        {text}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-xl md:text-3xl mt-8 text-purple-400"
      >
        {sub}
      </motion.p>
    </div>
  );
}

function LogoFinish() {
  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-[150px] opacity-20"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      <motion.h1
        initial={{ scale: 0.8, opacity: 0, letterSpacing: "1em" }}
        animate={{ scale: 1, opacity: 1, letterSpacing: "0em" }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="text-8xl md:text-[10rem] font-black uppercase"
      >
        DevLink
      </motion.h1>
      
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "auto" }}
        transition={{ delay: 1.5 }}
        className="overflow-hidden"
      >
        <p className="text-3xl md:text-5xl font-light mt-8 tracking-widest text-gray-300">
          BUILD TOGETHER
        </p>
      </motion.div>
    </div>
  );
}
