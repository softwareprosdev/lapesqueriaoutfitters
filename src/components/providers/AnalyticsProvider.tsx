'use client'

import GoogleAnalytics from './GoogleAnalytics'
import MicrosoftClarity from './MicrosoftClarity'

export default function AnalyticsProvider() {
  return (
    <>
      {/* Google Analytics 4 - Traffic, conversions, demographics */}
      <GoogleAnalytics />

      {/* Microsoft Clarity - Heatmaps, session recordings, user behavior */}
      <MicrosoftClarity />
    </>
  )
}
