'use client';

export function OceanAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 via-teal-50/20 to-blue-50/30 dark:from-cyan-950/10 dark:via-teal-950/5 dark:to-blue-950/10 animate-gradient-shift"></div>
      
      {/* Floating bubbles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-cyan-300/20 to-teal-200/30 blur-sm animate-float-bubble"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `-${Math.random() * 20}%`,
            width: `${20 + Math.random() * 40}px`,
            height: `${20 + Math.random() * 40}px`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${15 + Math.random() * 20}s`,
          }}
        />
      ))}

      {/* Light rays from top */}
      <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-cyan-300/10 via-transparent to-transparent transform -skew-x-12 animate-shimmer"></div>
      <div className="absolute top-0 left-1/2 w-2 h-full bg-gradient-to-b from-teal-300/15 via-transparent to-transparent transform -skew-x-12 animate-shimmer" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-blue-300/10 via-transparent to-transparent transform -skew-x-12 animate-shimmer" style={{ animationDelay: '4s' }}></div>

      {/* Glowing orbs */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-rose-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-40 left-10 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-violet-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-cyan-300/20 to-teal-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

      {/* Sparkle effects */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
