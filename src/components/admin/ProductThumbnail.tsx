'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface ProductThumbnailProps {
  src: string | null | undefined;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProductThumbnail({ src, alt, size = 'md', className }: ProductThumbnailProps) {
  const [error, setError] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
  };

  if (!src || error) {
    return (
      <div
        className={cn(
          `w-${sizeClasses[size].width / 4} h-${sizeClasses[size].height / 4}`,
          "bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0",
          className
        )}
        title={alt}
      >
        <ImageOff className="w-5 h-5" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={sizeClasses[size].width}
      height={sizeClasses[size].height}
      className={cn(
        "object-cover rounded-lg shrink-0 border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800",
        className
      )}
      onError={() => setError(true)}
    />
  );
}
