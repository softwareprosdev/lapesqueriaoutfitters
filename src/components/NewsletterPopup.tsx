'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { X, Anchor, Fish, Waves } from 'lucide-react'
import Image from 'next/image'

export default function NewsletterPopup() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // Don't show popup for logged-in users
    if (session?.user) {
      return
    }

    // Check if user has already subscribed or dismissed
    const hasSubscribed = localStorage.getItem('newsletter-subscribed')
    const hasSeenPopup = localStorage.getItem('newsletter-popup-seen')
    const lastShown = localStorage.getItem('newsletter-popup-last-shown')

    if (hasSubscribed) {
      return
    }

    // Show popup if never seen before OR last shown more than 14 days ago
    const fourteenDaysAgo = Date.now() - (14 * 24 * 60 * 60 * 1000)

    if (!hasSeenPopup || (lastShown && parseInt(lastShown) < fourteenDaysAgo)) {
      // Show popup after 5 seconds for better UX
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [session])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('newsletter-popup-last-shown', Date.now().toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: '' }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('🎣 Welcome aboard! Your 10% discount is in your inbox!')
        setIsSuccess(true)
        setEmail('')

        // Mark as subscribed permanently
        localStorage.setItem('newsletter-subscribed', 'true')

        // Close popup after 4 seconds
        setTimeout(() => {
          setIsOpen(false)
        }, 4000)
      } else {
        setMessage(data.error || 'Something went wrong. Give it another cast!')
        setIsSuccess(false)
      }
    } catch {
      setMessage('Failed to subscribe. Try again later!')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#001F3F]/70 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
        <div
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 pointer-events-auto transform transition-all animate-in fade-in zoom-in duration-300 my-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-2"
            aria-label="Close popup"
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Fishing-themed Logo/Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                <Image
                  src="/images/lapescerialogo.png"
                  alt="La Pesqueria Outfitters"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>
            </div>

            {/* Wave decoration */}
            <div className="flex justify-center gap-1 mb-3 text-[#FF4500]">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl font-black text-[#001F3F] mb-2 uppercase tracking-tight">
              Join the Crew!
            </h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Get <strong className="text-[#FF4500]">10% OFF</strong> your first order + early access to new fishing gear drops!
            </p>

            {/* Success/Error Message */}
            {message && (
              <div className={`mb-4 p-4 rounded-lg flex items-center justify-center gap-2 ${
                isSuccess
                  ? 'bg-green-100 border border-green-300 text-green-800'
                  : 'bg-red-100 border border-red-300 text-red-700'
              }`}>
                {isSuccess && <Fish className="w-5 h-5" />}
                {message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-[#FF4500] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF4500] hover:bg-[#FF5722] text-white font-bold py-3 text-base rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Anchor className="w-5 h-5" />
                {loading ? ' Casting Line...' : 'Get My 10% OFF'}
              </button>
            </form>

            {/* Benefits */}
            <div className="mt-5 pt-5 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-3 text-xs text-gray-600">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">🎁</span>
                  <span className="font-medium">Exclusive Deals</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">🎣</span>
                  <span className="font-medium">New Gear First</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">🚢</span>
                  <span className="font-medium">Free Shipping</span>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <p className="text-xs text-gray-400 mt-4">
              No spam, just catches! Unsubscribe anytime.
            </p>

            {/* Skip Link */}
            <button
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-[#001F3F] underline mt-4 transition-colors font-medium"
              type="button"
            >
              Maybe later, captain
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
