'use client'

import Script from 'next/script'

const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

export default function MicrosoftClarity() {
  if (!CLARITY_PROJECT_ID) {
    return null
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
        `,
      }}
    />
  )
}

// Helper to identify users (optional - for logged in users)
export function identifyUser(userId: string, customData?: Record<string, string>) {
  if (!CLARITY_PROJECT_ID || typeof window === 'undefined') return

  // @ts-expect-error - Clarity is loaded dynamically
  window.clarity?.('identify', userId, customData)
}

// Helper to set custom tags for filtering in Clarity dashboard
export function setClarityTag(key: string, value: string) {
  if (!CLARITY_PROJECT_ID || typeof window === 'undefined') return

  // @ts-expect-error - Clarity is loaded dynamically
  window.clarity?.('set', key, value)
}

// Track custom events in Clarity
export function trackClarityEvent(eventName: string) {
  if (!CLARITY_PROJECT_ID || typeof window === 'undefined') return

  // @ts-expect-error - Clarity is loaded dynamically
  window.clarity?.('event', eventName)
}
