export default function HashtagPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hashtag Header skeleton */}
        <div className="bg-[#0d0d12] rounded-2xl p-8 mb-8 border border-white/10 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl" />
            <div>
              <div className="h-8 w-48 bg-white/10 rounded mb-2" />
              <div className="h-4 w-24 bg-white/5 rounded" />
            </div>
          </div>
          <div className="h-4 w-64 bg-white/5 rounded" />
        </div>

        {/* Posts Feed skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-[#0d0d12] rounded-2xl p-6 border border-white/10 animate-pulse">
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
                <div className="h-4 w-2/3 bg-white/10 rounded" />
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                <div className="h-6 w-12 bg-white/5 rounded" />
                <div className="h-6 w-12 bg-white/5 rounded" />
                <div className="h-6 w-12 bg-white/5 rounded" />
                <div className="h-6 w-12 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

