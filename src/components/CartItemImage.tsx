'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CartItemImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export default function CartItemImage({ src, alt, className }: CartItemImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-cyan-100", className)}>
         <div className="w-1/2 h-1/2 bg-cyan-200 rounded-full" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="96px"
      className={cn("object-cover", className)}
      onError={() => setError(true)}
    />
  );
}
