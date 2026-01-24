'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export function BirthdaySurprise() {
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if today is January 31st
    const checkDate = () => {
      const now = new Date();
      const month = now.getMonth() + 1; // January = 1
      const day = now.getDate();
      
      // Show ONLY on January 31st
      if (month === 1 && day === 31) {
        setShow(true);
        
        // Fire confetti once when first shown
        if (!hasShown) {
          fireConfetti();
          setHasShown(true);
        }
      }
    };

    checkDate();
    // Check every hour in case the day changes while app is open
    const interval = setInterval(checkDate, 60000 * 60);
    
    return () => clearInterval(interval);
  }, [hasShown]);

  const fireConfetti = () => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Confetti from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493', '#C71585']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#87CEEB', '#00CED1', '#20B2AA', '#48D1CC', '#40E0D0']
      });
    }, 250);
  };

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-fade-in" />
      
      {/* Birthday Card */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-cyan-100 dark:from-pink-900 dark:via-purple-900 dark:to-cyan-900 rounded-3xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full pointer-events-auto animate-scale-in border-4 border-white dark:border-pink-300 relative overflow-hidden">
          
          {/* Sparkles background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Birthday Emoji */}
            <div className="text-8xl sm:text-9xl mb-6 animate-bounce">
              🎂
            </div>

            {/* Message */}
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-shift">
              HAPPY BIRTHDAY
            </h1>
            <h2 className="text-5xl sm:text-7xl font-black mb-6 text-pink-600 dark:text-pink-400 drop-shadow-lg">
              LA PESQUERIA!
            </h2>

            {/* Birthday Hearts */}
            <div className="flex justify-center gap-4 text-4xl sm:text-5xl mb-6 animate-pulse-slow">
              💖 🌊 💎 ✨ 🐋
            </div>

            {/* Sweet Message */}
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mb-4 font-medium">
              Wishing you the most magical birthday ever!
            </p>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 italic">
              May your day be filled with ocean breezes, beautiful treasures, and endless joy! 🌊✨
            </p>

            {/* Decorative Elements */}
            <div className="mt-8 flex justify-center gap-3">
              <div className="w-3 h-3 rounded-full bg-pink-400 animate-ping" />
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-ping" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>

          {/* Close button (small, in corner) */}
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.5) rotate(-10deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
}
