'use client';

import { Anchor, WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#001233] to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shadow-lg shadow-gold/25">
          <Anchor className="w-10 h-10 text-white" />
        </div>

        {/* Offline Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
          <WifiOff className="w-8 h-8 text-slate-400" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-3">You're Offline</h1>
        <p className="text-slate-400 mb-8">
          It looks like you've lost your connection. Don't worry - cached marine data is still available.
          Check your connection and try again.
        </p>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-amber-600 text-white rounded-xl font-semibold hover:from-amber-500 hover:to-gold transition-all shadow-lg shadow-gold/25"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>

        {/* Tips */}
        <div className="mt-12 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-left">
          <h3 className="text-gold font-semibold mb-2">While You're Offline:</h3>
          <ul className="text-slate-400 text-sm space-y-2">
            <li>• Previously loaded tide data is available</li>
            <li>• Weather forecasts may be outdated</li>
            <li>• AIS vessel tracking requires connection</li>
            <li>• Saved yacht profiles are accessible</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="mt-8 text-slate-500 text-sm">
          La Pesqueria Elite Marine Dashboard
        </p>
      </div>
    </div>
  );
}
