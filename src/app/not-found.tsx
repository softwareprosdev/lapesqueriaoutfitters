'use client';

import Link from 'next/link';
import { Anchor } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-[#001F3F] rounded-full shadow-xl">
            <Anchor className="h-12 w-12 text-[#FF4500]" />
          </div>
        </div>
        <h1 className="text-6xl font-black text-[#001F3F] mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase">Lost at Sea?</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          The page you&apos;re looking for has drifted away or never existed. Let&apos;s get you back to the main deck.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#FF4500] hover:bg-[#FF5722] text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg uppercase tracking-wide"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
