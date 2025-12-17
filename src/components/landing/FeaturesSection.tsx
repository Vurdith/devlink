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
    color: "from-[var(--color-accent)] to-[var(--color-accent-hover)]",
    glow: "rgba(var(--color-accent-rgb), 0.3)",
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
    color: "from-[var(--color-accent)] to-[var(--color-accent-hover)]",
    glow: "rgba(var(--color-accent-rgb), 0.3)",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative px-4 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] items-start">
          {/* Narrative header (left) */}
          <div className="animate-fade-in">
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-space-grotesk)] tracking-tight">
              <span className="text-white">A profile that</span>{" "}
              <span className="gradient-text">speaks for itself</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
              DevLink is designed around signal: work samples, reputation, and clarity, so the right people can find you fast.
            </p>

            <div className="mt-6 text-sm text-white/60 max-w-xl">
              Built to make it easy to show your work and connect with the right people.
            </div>
          </div>

          {/* Feature cards (right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="relative overflow-hidden rounded-3xl glass glass-hover border border-white/10 p-6 h-full noise-overlay">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(900px 240px at 30% 0%, ${feature.glow} 0%, transparent 65%)`,
                    }}
                  />

                  <div className={`relative inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>

                  <h3 className="relative text-lg font-semibold text-white mb-2 font-[var(--font-space-grotesk)]">
                    {feature.title}
                  </h3>
                  <p className="relative text-sm text-white/65 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
