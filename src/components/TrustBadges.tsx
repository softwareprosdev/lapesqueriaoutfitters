'use client';

import React from 'react';

interface TrustBadgesProps {
  showCashApp?: boolean;
  showApplePay?: boolean;
}

export function TrustBadges({ showCashApp = true, showApplePay = true }: TrustBadgesProps) {
  return (
    <div className="mt-4 pt-4 border-t border-slate-800">
      <p className="text-xs text-slate-500 mb-3 text-center">Secure checkout powered by</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Credit Cards */}
        <div className="flex items-center gap-1">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 py-1 rounded text-[10px] font-bold">
            VISA
          </div>
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-1 rounded text-[10px] font-bold">
            MC
          </div>
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white px-2 py-1 rounded text-[10px] font-bold">
            AMEX
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-2 py-1 rounded text-[10px] font-bold">
            DISC
          </div>
        </div>

        {/* Digital Payments */}
        <div className="flex items-center gap-1">
          {showApplePay && (
            <div className="bg-black text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Pay
            </div>
          )}
          {showCashApp && (
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
              <span className="text-[16px]">₿</span>
              App
            </div>
          )}
        </div>

        {}
        <div className="text-[10px] text-slate-500">
          Powered by <span className="font-semibold">Clover POS</span>
        </div>
      </div>

      {/* Security Icons */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1 text-slate-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px]">SSL Secured</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px]">Encrypted</span>
        </div>
      </div>
    </div>
  );
}

export default TrustBadges;
