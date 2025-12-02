export default function PostPageLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      {/* Main post skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="bg-[#0d0d12] rounded-2xl p-6 border border-white/10">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/10" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-white/10 rounded mb-2" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-4/5 bg-white/10 rounded" />
            <div className="h-4 w-3/5 bg-white/10 rounded" />
          </div>
          
          {/* Media placeholder */}
          <div className="h-64 w-full bg-white/5 rounded-xl mb-4" />
          
          {/* Actions */}
          <div className="flex items-center gap-6 pt-4 border-t border-white/10">
            <div className="h-8 w-16 bg-white/5 rounded-lg" />
            <div className="h-8 w-16 bg-white/5 rounded-lg" />
            <div className="h-8 w-16 bg-white/5 rounded-lg" />
            <div className="h-8 w-16 bg-white/5 rounded-lg" />
          </div>
        </div>
      </div>
      
      {/* Reply form skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="bg-[#0d0d12] rounded-xl p-4 border border-white/10">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1">
              <div className="h-20 w-full bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Replies skeleton */}
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#0d0d12] rounded-xl p-4 border border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                <div className="h-3 w-full bg-white/5 rounded mb-1" />
                <div className="h-3 w-3/4 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

