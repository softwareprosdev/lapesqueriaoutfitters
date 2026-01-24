'use client';

import { useEffect, useState } from 'react';

export function SwimmingWhaleShark() {
  const [position, setPosition] = useState({ x: -200, y: 20 });
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        const newX = prev.x + (2 * direction);
        const newY = 20 + Math.sin(newX / 100) * 15; // Gentle wave motion

        // Reverse direction at edges
        if (newX > window.innerWidth + 100) {
          setDirection(-1);
          return { x: window.innerWidth + 100, y: newY };
        } else if (newX < -200) {
          setDirection(1);
          return { x: -200, y: newY };
        }

        return { x: newX, y: newY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-100"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: direction === -1 ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      {/* Whale Shark SVG with glow effect */}
      <div className="relative animated-glow">
        {/* Glowing aura */}
        <div className="absolute inset-0 blur-xl opacity-40 animate-pulse-slow bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 rounded-full scale-150"></div>
        
        {/* Main whale shark */}
        <svg
          width="180"
          height="80"
          viewBox="0 0 180 80"
          className="relative drop-shadow-2xl"
        >
          {/* Body gradient */}
          <defs>
            <linearGradient id="whale-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: '#14b8a6', stopOpacity: 0.95 }} />
              <stop offset="100%" style={{ stopColor: '#0891b2', stopOpacity: 0.9 }} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Main body */}
          <ellipse cx="90" cy="40" rx="80" ry="30" fill="url(#whale-gradient)" filter="url(#glow)" />
          
          {/* Spots (whale shark pattern) */}
          <circle cx="60" cy="35" r="4" fill="white" opacity="0.6" />
          <circle cx="75" cy="30" r="3" fill="white" opacity="0.5" />
          <circle cx="85" cy="42" r="5" fill="white" opacity="0.7" />
          <circle cx="100" cy="35" r="3" fill="white" opacity="0.6" />
          <circle cx="110" cy="38" r="4" fill="white" opacity="0.5" />
          <circle cx="120" cy="32" r="3" fill="white" opacity="0.6" />
          <circle cx="70" cy="45" r="3" fill="white" opacity="0.5" />
          <circle cx="95" cy="48" r="4" fill="white" opacity="0.6" />

          {/* Dorsal fin */}
          <path d="M 90 15 L 100 5 L 110 15 Z" fill="url(#whale-gradient)" opacity="0.9" filter="url(#glow)" />
          
          {/* Pectoral fins */}
          <ellipse cx="50" cy="55" rx="20" ry="10" fill="url(#whale-gradient)" opacity="0.8" transform="rotate(-20 50 55)" />
          <ellipse cx="50" cy="25" rx="20" ry="10" fill="url(#whale-gradient)" opacity="0.8" transform="rotate(20 50 25)" />
          
          {/* Tail */}
          <path d="M 160 30 Q 175 25 170 40 Q 175 55 160 50 Z" fill="url(#whale-gradient)" opacity="0.9" filter="url(#glow)" />
          
          {/* Eye with sparkle */}
          <circle cx="30" cy="35" r="4" fill="#1e293b" />
          <circle cx="31" cy="34" r="1.5" fill="white" className="animate-pulse" />

          {/* Mouth */}
          <path d="M 15 40 Q 25 43 20 42" stroke="#1e293b" strokeWidth="1.5" fill="none" opacity="0.6" />

          {/* Bubbles trail */}
          <circle cx="165" cy="35" r="2" fill="cyan" opacity="0.3" className="animate-ping">
            <animate attributeName="r" from="2" to="5" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Trailing sparkles */}
        <div className="absolute -right-8 top-6 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
        <div className="absolute -right-12 top-10 w-1.5 h-1.5 bg-teal-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
}
