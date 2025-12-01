"use client";

import Link from "next/link";

// Floating geometric shapes with gradient colors
const floatingShapes = [
  { type: "hexagon", x: "10%", y: "20%", color: "from-purple-500 to-violet-600", size: 40, delay: "0s" },
  { type: "circle", x: "85%", y: "15%", color: "from-cyan-400 to-blue-500", size: 32, delay: "0.5s" },
  { type: "diamond", x: "75%", y: "70%", color: "from-pink-500 to-rose-500", size: 36, delay: "1s" },
  { type: "square", x: "15%", y: "75%", color: "from-amber-400 to-orange-500", size: 34, delay: "1.5s" },
  { type: "circle", x: "90%", y: "45%", color: "from-emerald-400 to-green-500", size: 28, delay: "2s" },
  { type: "hexagon", x: "5%", y: "50%", color: "from-indigo-400 to-purple-500", size: 24, delay: "2.5s" },
];

function FloatingShape({ type, color, size }: { type: string; color: string; size: number }) {
  const baseClass = `bg-gradient-to-br ${color} opacity-40`;
  
  switch (type) {
    case "hexagon":
      return (
        <div className={baseClass} style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", width: size, height: size }} />
      );
    case "circle":
      return <div className={`${baseClass} rounded-full`} style={{ width: size, height: size }} />;
    case "diamond":
      return <div className={`${baseClass} rotate-45`} style={{ width: size * 0.7, height: size * 0.7 }} />;
    case "square":
      return <div className={`${baseClass} rounded-lg`} style={{ width: size, height: size }} />;
    default:
      return <div className={`${baseClass} rounded-full`} style={{ width: size, height: size }} />;
  }
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.5)); }
          50% { filter: drop-shadow(0 0 40px rgba(168, 85, 247, 0.8)); }
        }
        @keyframes bounce-arrow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        @keyframes scroll-indicator {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(4px); opacity: 0.3; }
        }
        .float-animation {
          animation: float 4s ease-in-out infinite;
        }
        .pulse-glow-animation {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .arrow-animation {
          animation: bounce-arrow 1.5s ease-in-out infinite;
        }
        .scroll-animation {
          animation: scroll-indicator 2s ease-in-out infinite;
        }
      `}</style>

      {/* Floating geometric shapes - CSS only */}
      {floatingShapes.map((shape, i) => (
        <div
          key={i}
          className="absolute select-none pointer-events-none float-animation blur-[1px] opacity-0 animate-fade-in"
          style={{ 
            left: shape.x, 
            top: shape.y,
            animationDelay: shape.delay,
            animationDuration: `${4 + i * 0.5}s`,
          }}
        >
          <FloatingShape type={shape.type} color={shape.color} size={shape.size} />
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <img
            src="/logo/logo.png"
            alt="DevLink"
            className="w-24 h-24 md:w-32 md:h-32 mx-auto pulse-glow-animation"
          />
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-[var(--font-space-grotesk)] animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="gradient-text">Where Roblox</span>
          <br />
          <span className="text-white">Creators Unite</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg md:text-xl lg:text-2xl text-[var(--muted-foreground)] max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          The premier professional network for <span className="text-purple-400 font-semibold">developers</span>, 
          <span className="text-cyan-400 font-semibold"> clients</span>, 
          <span className="text-pink-400 font-semibold"> studios</span>, and 
          <span className="text-white font-semibold"> influencers</span> in the Roblox ecosystem.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <Link href="/register">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl font-semibold text-lg text-white overflow-hidden hover:from-purple-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30">
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <svg 
                  className="w-5 h-5 arrow-animation" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </Link>
          
          <Link href="/home">
            <button className="px-8 py-4 bg-[#0d0d12] rounded-2xl font-semibold text-lg text-white border border-white/20 hover:border-purple-500/50 hover:bg-white/5 transition-all duration-200 hover:scale-105 active:scale-95">
              Explore Feed
            </button>
          </Link>
        </div>

        {/* Trust badges */}
        <div
          className="mt-16 flex flex-wrap justify-center items-center gap-6 text-sm text-[var(--muted-foreground)] animate-fade-in"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free to join</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure platform</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Trusted by creators</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2 scroll-animation" />
        </div>
      </div>
    </section>
  );
}
