'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Anchor, Timer } from 'lucide-react';

export function SaleBanner() {
  const [show, setShow] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('sale-banner-dismissed');
    if (dismissed) {
      setShow(false);
      return;
    }

    // Calculate time until Feb 28, 2026 23:59:59
    const calculateTimeLeft = () => {
      const endDate = new Date('2026-02-28T23:59:59');
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('Sale Ended');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left!`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h left!`);
      } else {
        setTimeLeft('Almost done!');
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('sale-banner-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="relative bg-[#001F3F] text-white overflow-hidden">
      {/* Fishing-themed background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,69,0,0.3),transparent_50%)]" />
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#FF4500] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-orange-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-3">
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          {/* Anchor Icon */}
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF4500] animate-bounce" />
          </div>

          {/* Main text */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
            <span className="font-black text-lg sm:text-xl uppercase tracking-wide">
              <span className="text-[#FF4500]">Flash Sale!</span> 25% OFF
            </span>
            <span className="text-sm sm:text-base font-medium bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Use code: <span className="text-[#FF4500] font-bold">FISH25</span>
            </span>
            {timeLeft && (
              <span className="text-xs sm:text-sm font-semibold text-cyan-400 flex items-center gap-1">
                <Timer className="w-4 h-4" />
                {timeLeft}
              </span>
            )}
          </div>

          {/* CTA Button */}
          <Link
            href="/products"
            className="bg-[#FF4500] hover:bg-[#FF5722] text-white px-5 py-2 rounded-full font-bold text-sm sm:text-base transition-all hover:scale-105 shadow-lg flex items-center gap-1"
          >
            Shop Now
            <span className="text-lg leading-none">🎣</span>
          </Link>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 sm:relative sm:right-auto sm:top-auto sm:translate-y-0 p-1.5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF4500] to-transparent" />
    </div>
  );
}
