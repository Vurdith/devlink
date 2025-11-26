"use client";

/**
 * PERFORMANCE OPTIMIZED background
 * Removed expensive blur filters - uses simple gradients instead
 */
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
      {/* Base solid background */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      
      {/* Simple gradient overlays - no blur, GPU accelerated */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-40"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)',
        }}
      />
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-30"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(34, 211, 238, 0.06) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
