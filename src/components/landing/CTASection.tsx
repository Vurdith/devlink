// Server Component - No client JS needed
import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background gradient - CSS only */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent" />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="relative rounded-[2rem] overflow-hidden animate-fade-in">
          {/* Card background */}
          <div className="absolute inset-0 glass" />
          
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-[2rem] border border-white/10" />
          <div 
            className="absolute inset-[1px] rounded-[calc(2rem-1px)]"
            style={{
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, transparent 50%, rgba(34, 211, 238, 0.1) 100%)",
            }}
          />

          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-sm font-medium text-purple-400">Start building your presence today</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-[var(--font-space-grotesk)]">
              <span className="text-white">Ready to </span>
              <span className="gradient-text">Level Up</span>
              <span className="text-white">?</span>
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10">
              Join DevLink today and connect with thousands of Roblox developers, clients, and studios. 
              Your next big opportunity is just a click away.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <button className="group relative px-10 py-5 rounded-2xl font-semibold text-lg overflow-hidden bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
                  <span className="relative z-10 flex items-center gap-2 text-white">
                    Create Free Account
                    <svg 
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </Link>
              
              <Link href="/discover">
                <button className="px-10 py-5 rounded-2xl font-semibold text-lg text-white border border-white/20 hover:border-purple-500/50 hover:bg-white/5 transition-all duration-300 hover:scale-105 active:scale-95">
                  Discover Developers
                </button>
              </Link>
            </div>

            {/* Features list */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-[var(--muted-foreground)]">
              {[
                "No credit card required",
                "Free portfolio hosting",
                "Instant access",
                "Community support",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-[var(--muted-foreground)] text-sm">
          <p className="mb-4">Built for the Roblox community</p>
          <div className="flex justify-center gap-6">
            <Link href="/home" className="hover:text-white transition-colors">Home</Link>
            <Link href="/discover" className="hover:text-white transition-colors">Discover</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
