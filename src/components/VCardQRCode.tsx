'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Import QRCode dynamically to avoid SSR issues
const QRCode = dynamic(() => import('react-qr-code'), { ssr: false });

interface VCardQRCodeProps {
  size?: number;
}

export function VCardQRCode({ size = 120 }: VCardQRCodeProps) {
  const [showQR, setShowQR] = useState(false);

  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:La Pesqueria Outfitters
ORG:La Pesqueria Outfitters
TITLE:Premium Fishing Apparel & Gear
TEL:+1-956-555-0123
TEL;TYPE=WORK:+1-956-555-0123
URL:https://lapesqueria.com
ADR;TYPE=WORK:;;4400 N 23rd St Suite 135;McAllen;TX;78504;USA
EMAIL:info@lapesqueria.com
NOTE:Premium fishing apparel and gear for the modern angler. UPF 50+ protection, moisture-wicking technology.
END:VCARD`;

  // Create a data URL for direct contact saving (works on iOS)
  const vCardDataUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCardData)}`;

  const saveContactDirectly = () => {
    // For iOS devices, this will automatically open Contacts app
    const link = document.createElement('a');
    link.href = vCardDataUrl;
    link.download = 'la-pesqueria-outfitters.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative flex gap-2">
      {/* Direct Save Contact Button - Works on iOS */}
      <button
        onClick={saveContactDirectly}
        className="flex items-center gap-2 bg-[#001F3F] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#002D5C] transition-all shadow-md text-sm"
        title="Save contact directly to your device"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h2a2 2 0 012 2v4m-6 4h6m6 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V11m6 0H6m6 0h6m0 0v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z" />
        </svg>
        Save Contact
      </button>

      {/* QR Code Button */}
      <button
        onClick={() => setShowQR(!showQR)}
        className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#E63900] transition-all shadow-md text-sm"
        title="Show QR code for contact sharing"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        QR Code
      </button>

      {showQR && (
        <div className="absolute z-50 bottom-full right-0 mb-3">
          <div className="bg-white p-4 rounded-xl shadow-2xl border-2 border-[#001F3F] min-w-[280px]">
            <div className="text-center mb-3">
              <p className="text-sm font-semibold text-gray-800">Scan to Save Contact</p>
              <p className="text-xs text-gray-500">Perfect for sharing with others</p>
            </div>
            <div className="bg-white p-3 rounded-lg border-2 border-gray-100">
              <QRCode
                value={vCardData}
                size={size}
                level="M"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => {
                  const svg = document.querySelector('.qr-code-container svg');
                  if (svg) {
                    const svgData = new XMLSerializer().serializeToString(svg);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = size;
                      canvas.height = size;
                      ctx?.fillRect(0, 0, size, size);
                      ctx?.drawImage(img, 0, 0);
                      const pngFile = canvas.toDataURL('image/png');
                      const downloadLink = document.createElement('a');
                      downloadLink.download = 'la-pesqueria-contact-qr.png';
                      downloadLink.href = pngFile;
                      downloadLink.click();
                    };
                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                  }
                }}
                className="w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors font-medium"
              >
                📥 Download QR Code
              </button>
              <p className="text-xs text-gray-500 text-center">
                Includes: 📍 Address • 📞 Phone • 🌐 Website • 📧 Email
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function QRCodeWrapper({ value, size = 120 }: { value: string; size?: number }) {
  return (
    <div className="qr-code-container inline-block p-2 bg-white rounded-lg">
      <QRCode
        value={value}
        size={size}
        level="M"
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
}
