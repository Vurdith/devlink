"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Ad scenes with timing (in ms)
const SCENES = [
  // Scene 0: Chaos intro
  { id: 'chaos-1', duration: 800, type: 'chaos', text: '💬 Random Discord DMs?' },
  { id: 'chaos-2', duration: 800, type: 'chaos', text: '❓ Unverified work?' },
  { id: 'chaos-3', duration: 800, type: 'chaos', text: '⏰ Missed deadlines?' },
  { id: 'chaos-4', duration: 800, type: 'chaos', text: '🚫 No protection?' },
  { id: 'chaos-5', duration: 1200, type: 'nope', text: 'Yeah... no.' },
  
  // Scene 1: Logo reveal
  { id: 'logo', duration: 2500, type: 'logo' },
  
  // Scene 2: Features rapid fire
  { id: 'feature-1', duration: 1000, type: 'feature', text: 'Verified Portfolios', icon: '✓' },
  { id: 'feature-2', duration: 1000, type: 'feature', text: 'Real Project History', icon: '📁' },
  { id: 'feature-3', duration: 1000, type: 'feature', text: 'Skills & Ratings', icon: '⭐' },
  { id: 'feature-4', duration: 1000, type: 'feature', text: 'Proof of Work', icon: '💼' },
  
  // Scene 3: Search
  { id: 'search', duration: 2000, type: 'search' },
  
  // Scene 4: Escrow
  { id: 'escrow', duration: 2500, type: 'escrow' },
  
  // Scene 5: Team tools
  { id: 'team', duration: 2000, type: 'team' },
  
  // Scene 6: Marketplace
  { id: 'market-1', duration: 600, type: 'market', text: 'Sell assets.' },
  { id: 'market-2', duration: 600, type: 'market', text: 'License code.' },
  { id: 'market-3', duration: 600, type: 'market', text: 'Offer services.' },
  { id: 'market-4', duration: 600, type: 'market', text: 'Get hired.' },
  { id: 'market-5', duration: 1500, type: 'ecosystem' },
  
  // Scene 7: Trust
  { id: 'trust-1', duration: 800, type: 'trust', text: 'Every dev is verified.' },
  { id: 'trust-2', duration: 800, type: 'trust', text: 'Every studio is vetted.' },
  { id: 'trust-3', duration: 800, type: 'trust', text: 'Every payment is protected.' },
  { id: 'trust-4', duration: 1500, type: 'noBS' },
  
  // Scene 8: Punchline
  { id: 'punch', duration: 3000, type: 'punchline' },
  
  // Scene 9: Final CTA
  { id: 'final', duration: 4000, type: 'final' },
];

// Calculate total duration for loop
const TOTAL_DURATION = SCENES.reduce((acc, scene) => acc + scene.duration, 0);

export default function AdPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Scene progression
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 50;
        if (next >= TOTAL_DURATION) {
          setCurrentScene(0);
          return 0;
        }
        
        // Calculate which scene we should be on
        let accumulated = 0;
        for (let i = 0; i < SCENES.length; i++) {
          accumulated += SCENES[i].duration;
          if (next < accumulated) {
            if (i !== currentScene) {
              setCurrentScene(i);
            }
            break;
          }
        }
        
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentScene]);

  const scene = SCENES[currentScene];

  return (
    <div className="fixed inset-0 bg-[#050508] overflow-hidden select-none cursor-default">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-fuchsia-900/20" />
        <GridBackground />
      </div>

      {/* Scene content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {scene.type === 'chaos' && <ChaosScene text={scene.text!} />}
          {scene.type === 'nope' && <NopeScene />}
          {scene.type === 'logo' && <LogoScene />}
          {scene.type === 'feature' && <FeatureScene text={scene.text!} icon={scene.icon!} />}
          {scene.type === 'search' && <SearchScene />}
          {scene.type === 'escrow' && <EscrowScene />}
          {scene.type === 'team' && <TeamScene />}
          {scene.type === 'market' && <MarketScene text={scene.text!} />}
          {scene.type === 'ecosystem' && <EcosystemScene />}
          {scene.type === 'trust' && <TrustScene text={scene.text!} />}
          {scene.type === 'noBS' && <NoBSScene />}
          {scene.type === 'punchline' && <PunchlineScene />}
          {scene.type === 'final' && <FinalScene />}
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
          style={{ width: `${(elapsedTime / TOTAL_DURATION) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Animated grid background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
        }}
      />
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}

// Scene: Chaos pain points
function ChaosScene({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ scale: 0.5, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      className="text-center"
    >
      <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-red-500 glitch-text">
        {text}
      </div>
      <style jsx>{`
        .glitch-text {
          text-shadow: 
            2px 0 #00ffff, 
            -2px 0 #ff00ff,
            0 0 20px rgba(255, 0, 0, 0.5);
          animation: glitch 0.3s infinite;
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
        }
      `}</style>
    </motion.div>
  );
}

// Scene: Yeah... no
function NopeScene() {
  return (
    <motion.div
      initial={{ scale: 2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center"
    >
      <div className="text-6xl md:text-8xl lg:text-9xl font-black text-red-500">
        ✕
      </div>
      <div className="text-3xl md:text-5xl font-bold text-white mt-4">
        Yeah... no.
      </div>
    </motion.div>
  );
}

// Scene: Logo reveal
function LogoScene() {
  return (
    <motion.div className="text-center">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl md:text-2xl text-gray-400 mb-6"
      >
        Introducing
      </motion.p>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="relative inline-block"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-fuchsia-500 blur-3xl opacity-50 scale-150" />
        <h1 className="relative text-7xl md:text-9xl lg:text-[12rem] font-black bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
          DevLink
        </h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xl md:text-3xl text-gray-300 mt-6"
      >
        Built for <span className="text-white font-bold">REAL</span> developers
      </motion.p>
    </motion.div>
  );
}

// Scene: Feature callout
function FeatureScene({ text, icon }: { text: string; icon: string }) {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex items-center gap-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-4xl md:text-5xl"
      >
        {icon}
      </motion.div>
      <span className="text-4xl md:text-6xl lg:text-7xl font-bold text-white">
        {text}
      </span>
    </motion.div>
  );
}

// Scene: Search filters
function SearchScene() {
  const roles = ['Programmer', '3D Artist', 'UI Designer', 'SFX', 'Animator'];
  
  return (
    <motion.div className="text-center px-4">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl md:text-4xl text-gray-300 mb-8"
      >
        Find the <span className="text-purple-400 font-bold">perfect match</span>
      </motion.p>
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
        {roles.map((role, i) => (
          <motion.span
            key={role}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="px-6 py-3 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 text-lg md:text-2xl font-medium"
          >
            {role}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

// Scene: Escrow flow
function EscrowScene() {
  const steps = [
    { icon: '💰', label: 'Funds Held' },
    { icon: '🔨', label: 'Work Starts' },
    { icon: '✅', label: 'Approved' },
    { icon: '🎉', label: 'Paid' },
  ];

  return (
    <motion.div className="text-center px-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-bold text-white mb-12"
      >
        Secure <span className="text-green-400">Escrow</span> Payments
      </motion.h2>
      <div className="flex items-center justify-center gap-2 md:gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center text-3xl md:text-4xl">
                {step.icon}
              </div>
              <span className="text-xs md:text-sm text-gray-400 mt-2">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.15 + 0.1 }}
                className="mx-1 md:mx-3 text-green-400 text-xl md:text-2xl"
              >
                →
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Scene: Team tools
function TeamScene() {
  const tools = ['Team Hubs', 'Task Boards', 'Project Chats', 'Version Control'];

  return (
    <motion.div className="text-center px-4">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl md:text-5xl font-bold text-white mb-8"
      >
        Operate like a <span className="text-purple-400">studio</span>
      </motion.h2>
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        {tools.map((tool, i) => (
          <motion.div
            key={tool}
            initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-lg md:text-2xl text-white font-medium"
          >
            {tool}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Scene: Market action
function MarketScene({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center"
    >
      <span className="text-5xl md:text-7xl lg:text-8xl font-black text-white">
        {text}
      </span>
    </motion.div>
  );
}

// Scene: Ecosystem
function EcosystemScene() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center px-4"
    >
      <p className="text-2xl md:text-4xl text-gray-400 mb-4">It&apos;s not just hiring—</p>
      <h2 className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
        A Full Developer Ecosystem
      </h2>
    </motion.div>
  );
}

// Scene: Trust point
function TrustScene({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex items-center gap-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-green-500 flex items-center justify-center"
      >
        <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-white">
        {text}
      </span>
    </motion.div>
  );
}

// Scene: No BS
function NoBSScene() {
  const items = ['No scams.', 'No ghosting.', 'No drama.'];

  return (
    <motion.div className="flex flex-wrap justify-center gap-4 md:gap-8 px-4">
      {items.map((item, i) => (
        <motion.span
          key={item}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.15 }}
          className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-red-500/20 border-2 border-red-500 text-red-400 text-xl md:text-3xl font-bold"
        >
          {item}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Scene: Punchline
function PunchlineScene() {
  return (
    <motion.div className="text-center px-4">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl md:text-2xl text-gray-400 mb-6"
      >
        Whether you&apos;re building your first game or scaling a studio—
      </motion.p>
      <motion.h2
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="text-5xl md:text-7xl lg:text-8xl font-black"
      >
        <span className="text-white">DevLink makes it </span>
        <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">effortless.</span>
      </motion.h2>
    </motion.div>
  );
}

// Scene: Final CTA
function FinalScene() {
  return (
    <motion.div className="text-center">
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 rounded-full blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="relative"
      >
        <h1 className="text-8xl md:text-9xl lg:text-[14rem] font-black bg-gradient-to-r from-purple-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent leading-none">
          DevLink
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 space-y-2"
      >
        <p className="text-2xl md:text-3xl text-gray-300">
          Your team. Your tools. Your future.
        </p>
        <p className="text-xl md:text-2xl text-gray-500">
          All in one place.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="mt-12"
      >
        <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
          Build Together.
        </span>
      </motion.div>
    </motion.div>
  );
}
