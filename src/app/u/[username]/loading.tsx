export default function ProfileLoading() {
  return (
    <main className="mx-auto max-w-5xl px-2 sm:px-4 py-4 sm:py-10">
      <section className="relative overflow-hidden rounded-xl sm:rounded-2xl animate-pulse">
        {/* Banner skeleton */}
        <div className="h-36 sm:h-64 w-full bg-gradient-to-br from-[var(--color-accent-hover)]/30 via-[var(--color-accent)]/20 to-[var(--color-accent-hover)]/30" />
        
        {/* Profile card skeleton */}
        <div className="relative bg-[#0a0a0f]/95 border-t border-[var(--color-accent)]/20 px-4 sm:px-8 pb-4 sm:pb-8">
          {/* Avatar */}
          <div className="flex justify-between items-start">
            <div className="relative -mt-12 sm:-mt-16 z-20">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/10 border-4 border-[#0a0a0f]" />
            </div>
            {/* Follow button placeholder */}
            <div className="mt-3 w-24 h-9 bg-white/10 rounded-lg" />
          </div>
          
          {/* Name & username */}
          <div className="mt-3 space-y-2">
            <div className="h-6 sm:h-8 w-48 bg-white/10 rounded" />
            <div className="h-4 w-24 bg-white/5 rounded" />
          </div>
          
          {/* Profile type badge */}
          <div className="mt-2">
            <div className="h-6 w-20 bg-white/10 rounded-full" />
          </div>
          
          {/* Stats row */}
          <div className="mt-3 flex gap-2">
            <div className="h-7 w-24 bg-white/10 rounded-full" />
            <div className="h-7 w-24 bg-white/10 rounded-full" />
          </div>
          
          {/* Bio */}
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-3/4 bg-white/10 rounded" />
          </div>
        </div>
      </section>
      
      {/* Tabs skeleton */}
      <div className="mt-4 sm:mt-8">
        <div className="flex gap-2 mb-6 bg-black/40 rounded-2xl p-3 border border-[var(--color-accent)]/20">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-20 bg-white/10 rounded-lg" />
          ))}
        </div>
        
        {/* Posts skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0d0d12] rounded-xl border border-white/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 w-24 bg-white/10 rounded" />
                    <div className="h-4 w-16 bg-white/5 rounded" />
                  </div>
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}



