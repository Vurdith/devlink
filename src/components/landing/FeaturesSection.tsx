// Server Component - No client JS needed
const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: "Portfolio Showcase",
    description: "Display your best work with beautiful portfolio galleries. Share game dev projects, scripts, models, and more.",
    color: "from-purple-500 to-violet-600",
    glow: "rgba(168, 85, 247, 0.3)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Connect & Collaborate",
    description: "Find the perfect team members for your next project. Connect with developers, artists, scripters, and builders.",
    color: "from-cyan-500 to-blue-600",
    glow: "rgba(34, 211, 238, 0.3)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Find Opportunities",
    description: "Discover job postings, commissions, and collaboration requests from studios and clients looking for talent.",
    color: "from-pink-500 to-rose-600",
    glow: "rgba(244, 114, 182, 0.3)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "Verified Profiles",
    description: "Build trust with verified badges. Showcase your credentials and establish credibility in the community.",
    color: "from-emerald-500 to-green-600",
    glow: "rgba(16, 185, 129, 0.3)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "Reviews & Ratings",
    description: "Give and receive reviews to build your reputation. Help others find reliable collaborators.",
    color: "from-amber-500 to-orange-600",
    glow: "rgba(245, 158, 11, 0.3)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Community Feed",
    description: "Stay updated with the latest from the community. Share updates, showcase progress, and get inspired.",
    color: "from-indigo-500 to-purple-600",
    glow: "rgba(99, 102, 241, 0.3)",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-32 px-4">
      {/* Section header */}
      <div className="text-center mb-20 animate-fade-in">
        <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-6">
          Platform Features
        </span>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-[var(--font-space-grotesk)]">
          <span className="text-white">Everything You Need to</span>
          <br />
          <span className="gradient-text">Succeed</span>
        </h2>
        
        <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
          From showcasing your work to finding your next big project, DevLink has all the tools you need.
        </p>
      </div>

      {/* Features grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group relative animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div 
              className="relative p-8 rounded-3xl glass overflow-hidden h-full transition-all duration-300 hover:bg-white/[0.08] hover:-translate-y-1"
              style={{
                boxShadow: `0 0 0 1px rgba(255,255,255,0.05)`
              }}
            >
              {/* Gradient background on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${feature.glow} 0%, transparent 70%)`
                }}
              />
              
              {/* Icon */}
              <div className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}>
                <div className="text-white">
                  {feature.icon}
                </div>
              </div>
              
              {/* Content */}
              <h3 className="relative text-xl font-semibold text-white mb-3 font-[var(--font-space-grotesk)]">
                {feature.title}
              </h3>
              
              <p className="relative text-[var(--muted-foreground)] leading-relaxed">
                {feature.description}
              </p>

              {/* Arrow indicator */}
              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
