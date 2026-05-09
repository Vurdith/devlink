// Server Component - No client JS needed
import { surface } from "@/components/ui/design-system";
const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: "Portfolio Showcase",
    description: "Display your best work with beautiful portfolio galleries. Share game dev projects, scripts, models, and more.",
    color: "from-[rgba(var(--color-accent-2-rgb),0.18)] to-[rgba(var(--color-accent-rgb),0.18)]",
    glow: "rgba(34, 211, 238, 0.16)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Connect & Collaborate",
    description: "Find the perfect team members for your next project. Connect with developers, artists, scripters, and builders.",
    color: "from-[rgba(var(--color-accent-2-rgb),0.22)] to-[rgba(96,165,250,0.18)]",
    glow: "rgba(34, 211, 238, 0.16)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Find Opportunities",
    description: "Discover job postings, commissions, and collaboration requests from studios and clients looking for talent.",
    color: "from-[rgba(244,114,182,0.18)] to-[rgba(var(--color-accent-rgb),0.14)]",
    glow: "rgba(244, 114, 182, 0.14)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: "Verified Profiles",
    description: "Build trust with verified badges. Showcase your credentials and establish credibility in the community.",
    color: "from-[rgba(var(--color-accent-3-rgb),0.2)] to-[rgba(34,211,238,0.12)]",
    glow: "rgba(52, 211, 153, 0.14)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "Reviews & Ratings",
    description: "Give and receive reviews to build your reputation. Help others find reliable collaborators.",
    color: "from-[rgba(245,158,11,0.18)] to-[rgba(251,191,36,0.1)]",
    glow: "rgba(245, 158, 11, 0.12)",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Community Feed",
    description: "Stay updated with the latest from the community. Share updates, showcase progress, and get inspired.",
    color: "from-[rgba(var(--color-accent-rgb),0.18)] to-[rgba(var(--color-accent-2-rgb),0.16)]",
    glow: "rgba(139, 92, 246, 0.14)",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative px-4 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] items-start">
          {/* Narrative header (left) */}
          <div className="animate-fade-in lg:sticky lg:top-32">
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold font-[var(--font-space-grotesk)] tracking-tight">
              <span className="text-white">A profile that</span>{" "}
              <span className="gradient-text">speaks for itself</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/70 leading-relaxed max-w-xl">
              DevLink is designed around signal: work samples, reputation, and clarity, so the right people can find you fast.
            </p>

            {/* CTA to fill blank space */}
            <div className="mt-12 flex flex-col gap-8">
              <div className="flex">
                <a href="/register" className="group relative inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.045] px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]">
                  <span>Start your profile</span>
                  <svg className="w-4 h-4 opacity-70 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Feature cards (right) - Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="flex flex-col gap-4">
              {/* Column 1 items (0, 2, 4) */}
              {[features[0], features[2], features[4]].map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative animate-fade-in transition-transform duration-500 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Give the middle item in this col slightly more height for masonry effect */}
                  <div className={surface("panelMuted", `relative overflow-hidden p-6 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.28)] hover:bg-white/[0.04] ${index === 1 ? "md:py-9" : ""}`)}>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(800px 300px at 50% 100%, ${feature.glow} 0%, transparent 70%)`,
                      }}
                    />

                    <div className={`relative mb-5 inline-flex rounded-lg border border-white/[0.08] bg-gradient-to-br p-3 ${feature.color}`}>
                      <div className="text-white/90">{feature.icon}</div>
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

            <div className="flex flex-col gap-4 sm:mt-12">
              {/* Column 2 items (1, 3, 5) - Offset down for masonry look */}
              {[features[1], features[3], features[5]].map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative animate-fade-in transition-transform duration-500 hover:-translate-y-1"
                  style={{ animationDelay: `${(index + 1) * 0.15}s` }}
                >
                  <div className={surface("panelMuted", `relative overflow-hidden p-6 transition-colors hover:border-[rgba(var(--color-accent-2-rgb),0.28)] hover:bg-white/[0.04] ${index === 0 ? "md:py-9" : ""}`)}>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(800px 300px at 50% 100%, ${feature.glow} 0%, transparent 70%)`,
                      }}
                    />

                    <div className={`relative mb-5 inline-flex rounded-lg border border-white/[0.08] bg-gradient-to-br p-3 ${feature.color}`}>
                      <div className="text-white/90">{feature.icon}</div>
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
      </div>
    </section>
  );
}
