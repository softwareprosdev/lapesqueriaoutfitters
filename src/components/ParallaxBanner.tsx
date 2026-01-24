'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

function ParallaxBanner({ src, alt, text }: { src: string; alt: string, text?: string }) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yImage = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <div ref={containerRef} className="relative w-full h-[60vh] overflow-hidden bg-black">

      {/* 1. Moving Image Layer */}
      <motion.div style={{ y: yImage }} className="absolute inset-0 h-[140%] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          quality={80}
          priority={false}
          className="object-cover opacity-90"
        />
        {/* Dark overlay to ensure the glowing text is readable */}
        <div className="absolute inset-0 bg-black/60" />
      </motion.div>

      {/* 2. Fixed Text Layer (Bottom Right) */}
      {text && (
        <div className="absolute bottom-0 right-0 p-6 md:p-12 z-10 pointer-events-none text-right max-w-2xl">
           <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-widest leading-tight font-heading
                          bg-gradient-to-r from-slate-900 via-blue-900 to-orange-600
                          bg-clip-text text-transparent
                          drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
             {text}
           </h2>
        </div>
      )}
    </div>
  );
}

export default ParallaxBanner;
