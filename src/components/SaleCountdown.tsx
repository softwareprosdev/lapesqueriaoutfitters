'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame, AlertTriangle } from 'lucide-react';

interface SaleCountdownProps {
  endDate: Date | string;
  title?: string;
  discountCode?: string;
  discountPercentage?: number;
  variant?: 'banner' | 'card' | 'inline' | 'floating';
  onExpire?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function SaleCountdown({
  endDate,
  title = 'Flash Sale Ends In',
  discountCode,
  discountPercentage,
  variant = 'card',
  onExpire,
}: SaleCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeRemaining = useCallback((): TimeRemaining => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const total = end - now;

    if (total <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((total % (1000 * 60)) / 1000),
      total,
    };
  }, [endDate]);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining.total <= 0) {
        setIsExpired(true);
        onExpire?.();
        clearInterval(timer);
      }
    }, 1000);

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    return () => clearInterval(timer);
  }, [calculateTimeRemaining, onExpire]);

  if (!timeRemaining || isExpired) {
    return null;
  }

  const isUrgent = timeRemaining.total < 24 * 60 * 60 * 1000; // Less than 24 hours
  const isVeryUrgent = timeRemaining.total < 60 * 60 * 1000; // Less than 1 hour

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          text-2xl md:text-3xl font-bold tabular-nums
          ${isVeryUrgent ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-teal-600'}
        `}
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
  );

  const Separator = () => (
    <span className={`text-2xl font-bold ${isUrgent ? 'text-orange-400' : 'text-teal-400'}`}>:</span>
  );

  // Banner variant - full width strip
  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`
          w-full py-3 px-4
          ${isVeryUrgent ? 'bg-gradient-to-r from-red-600 to-orange-600' :
            isUrgent ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
            'bg-gradient-to-r from-teal-500 to-cyan-500'}
          text-white
        `}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            {isUrgent ? (
              <Flame className="w-5 h-5 animate-pulse" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
            <span className="font-bold">{title}</span>
            {discountPercentage && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm font-bold">
                {discountPercentage}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <TimeBlock value={timeRemaining.days} label="Days" />
            <Separator />
            <TimeBlock value={timeRemaining.hours} label="Hours" />
            <Separator />
            <TimeBlock value={timeRemaining.minutes} label="Mins" />
            <Separator />
            <TimeBlock value={timeRemaining.seconds} label="Secs" />
          </div>

          {discountCode && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Use code:</span>
              <code className="bg-white/20 px-3 py-1 rounded font-mono font-bold">
                {discountCode}
              </code>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Card variant - for product pages
  if (variant === 'card') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          rounded-xl p-4 shadow-lg border-2
          ${isVeryUrgent ? 'bg-red-50 border-red-200' :
            isUrgent ? 'bg-orange-50 border-orange-200' :
            'bg-teal-50 border-teal-200'}
        `}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isUrgent ? (
              <AlertTriangle className={`w-5 h-5 ${isVeryUrgent ? 'text-red-500' : 'text-orange-500'} animate-pulse`} />
            ) : (
              <Clock className="w-5 h-5 text-teal-600" />
            )}
            <span className={`font-bold ${isVeryUrgent ? 'text-red-700' : isUrgent ? 'text-orange-700' : 'text-teal-700'}`}>
              {title}
            </span>
          </div>
          {discountPercentage && (
            <span className={`
              px-2 py-1 rounded-full text-xs font-bold
              ${isVeryUrgent ? 'bg-red-500 text-white' :
                isUrgent ? 'bg-orange-500 text-white' :
                'bg-teal-500 text-white'}
            `}>
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        <div className="flex justify-center items-center gap-3 mb-3">
          <TimeBlock value={timeRemaining.days} label="Days" />
          <Separator />
          <TimeBlock value={timeRemaining.hours} label="Hours" />
          <Separator />
          <TimeBlock value={timeRemaining.minutes} label="Mins" />
          <Separator />
          <TimeBlock value={timeRemaining.seconds} label="Secs" />
        </div>

        {discountCode && (
          <div className="text-center">
            <span className="text-sm text-gray-600">Use code: </span>
            <code className={`
              px-3 py-1 rounded font-mono font-bold
              ${isVeryUrgent ? 'bg-red-200 text-red-800' :
                isUrgent ? 'bg-orange-200 text-orange-800' :
                'bg-teal-200 text-teal-800'}
            `}>
              {discountCode}
            </code>
          </div>
        )}

        {isUrgent && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center text-sm mt-2 font-medium ${isVeryUrgent ? 'text-red-600' : 'text-orange-600'}`}
          >
            {isVeryUrgent ? '⚡ Almost gone! Hurry!' : '🔥 Limited time offer!'}
          </motion.p>
        )}
      </motion.div>
    );
  }

  // Inline variant - minimal display
  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className={`w-4 h-4 ${isUrgent ? 'text-orange-500' : 'text-teal-600'}`} />
        <span className="text-gray-600">Ends in:</span>
        <span className={`font-bold ${isUrgent ? 'text-orange-600' : 'text-teal-600'}`}>
          {timeRemaining.days > 0 && `${timeRemaining.days}d `}
          {String(timeRemaining.hours).padStart(2, '0')}:
          {String(timeRemaining.minutes).padStart(2, '0')}:
          {String(timeRemaining.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  // Floating variant - fixed position reminder
  if (variant === 'floating') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className={`
            fixed bottom-4 right-4 z-50
            rounded-lg shadow-2xl p-4 max-w-xs
            ${isVeryUrgent ? 'bg-red-600 text-white' :
              isUrgent ? 'bg-orange-500 text-white' :
              'bg-white border-2 border-teal-500'}
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            {isUrgent ? (
              <Flame className="w-5 h-5 animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 text-teal-600" />
            )}
            <span className={`font-bold text-sm ${!isUrgent && 'text-teal-700'}`}>{title}</span>
          </div>

          <div className={`text-center font-mono text-xl font-bold ${!isUrgent && 'text-teal-600'}`}>
            {timeRemaining.days > 0 && `${timeRemaining.days}d `}
            {String(timeRemaining.hours).padStart(2, '0')}:
            {String(timeRemaining.minutes).padStart(2, '0')}:
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>

          {discountCode && (
            <div className="mt-2 text-center">
              <code className={`
                px-2 py-1 rounded text-sm font-mono
                ${isUrgent ? 'bg-white/20' : 'bg-teal-100 text-teal-800'}
              `}>
                {discountCode}
              </code>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}

export default SaleCountdown;
