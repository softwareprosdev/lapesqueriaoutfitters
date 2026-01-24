'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  featured?: boolean;
}

export default function ProductImageGallery({
  images,
  productName,
  featured = false,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (url: string) => {
    setFailedImages(prev => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  // If no images, show placeholder
  const displayImages = images.length > 0 ? images : [];
  const selectedImage = displayImages[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image with Bioluminescence Effect */}
      <div
        className={cn(
          "relative aspect-square bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg overflow-hidden group transition-all duration-500",
          "hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]", // Glow effect
        )}
      >
        {selectedImage && !failedImages.has(selectedImage) ? (
          <>
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt={productName}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={true}
                onError={() => handleImageError(selectedImage)}
              />
            </div>
            {/* Bioluminescence Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
               <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent mix-blend-overlay" />
               <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(6,182,212,0.15)_0%,transparent_70%)] animate-pulse-slow" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-9xl opacity-30 animate-pulse">🌊</div>
          </div>
        )}
        
        {featured && (
          <div className="absolute top-4 right-4 bg-coral-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse shadow-lg shadow-coral-500/20">
            Featured
          </div>
        )}
      </div>

      {/* Thumbnail Carousel */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all duration-300",
                selectedIndex === idx
                  ? "border-teal-500 ring-2 ring-teal-500/20 shadow-md scale-105 z-10"
                  : "border-transparent hover:border-teal-300 opacity-70 hover:opacity-100"
              )}
            >
              {!failedImages.has(img) ? (
                <Image
                  src={img}
                  alt={`${productName} - View ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, 10vw"
                  loading={idx === 0 ? "eager" : "lazy"}
                  priority={idx === 0}
                  onError={() => handleImageError(img)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-50">🌊</div>
              )}
              {selectedIndex === idx && (
                 <div className="absolute inset-0 bg-teal-500/10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
