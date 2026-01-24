'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), 200);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const toggleTooltip = () => {
    setIsVisible(!isVisible);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-900',
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      ref={tooltipRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onClick={toggleTooltip}
    >
      {children || (
        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
      )}

      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} w-64 p-3 bg-slate-900 text-white text-sm rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200`}
        >
          <p className="leading-relaxed">{content}</p>
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}

// Mobile-friendly tooltip that works on touch
export function MobileTooltip({
  content,
  title,
  children,
}: {
  content: string;
  title?: string;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {children || <HelpCircle className="h-4 w-4" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 right-0 mt-2 w-72 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            {title && (
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {title}
              </h4>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {content}
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors"
            >
              Got it
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Field label with help tooltip
interface FieldTooltipProps {
  label: string;
  helpText: string;
  required?: boolean;
}

export function FieldTooltip({ label, helpText, required }: FieldTooltipProps) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500">*</span>}
      <Tooltip content={helpText} />
    </label>
  );
}
