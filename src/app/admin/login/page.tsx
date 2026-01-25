'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Lock, Anchor } from 'lucide-react'

// Map NextAuth error codes to user-friendly messages
const errorMessages: Record<string, string> = {
  Configuration: 'There is a server configuration issue. Please contact support.',
  AccessDenied: 'Access denied. You do not have permission to access the admin panel.',
  Verification: 'The verification link has expired or has already been used.',
  Default: 'An error occurred during authentication. Please try again.',
  CredentialsSignin: 'Invalid email or password. Please check your credentials.',
}

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Handle error from URL parameters (NextAuth redirects with ?error=...)
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      setError(errorMessages[urlError] || errorMessages.Default)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#001F3F]">
      {/* Left Side - Fishing Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <Image
          src="/images/fishing.jpg"
          alt="Fishing gear and equipment"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001F3F]/80 via-[#001F3F]/60 to-[#001F3F]/90" />

        {/* Branding on Image */}
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/images/lapescerialogo.png"
              alt="La Pesqueria Outfitters"
              width={200}
              height={200}
              className="object-contain h-20 w-auto"
              priority
            />
          </div>
          <p className="text-2xl font-light mb-2">Premium Fishing Apparel</p>
          <p className="text-lg text-white/80 max-w-md">
            High-performance gear for the modern angler. UPF 50+ protection, moisture-wicking technology.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-4">
            <div className="flex justify-center">
              <Image
                src="/images/lapescerialogo.png"
                alt="La Pesqueria Outfitters"
                width={180}
                height={180}
                className="object-contain h-16 w-auto"
                priority
              />
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-[#001F3F] rounded-full">
                <Anchor className="h-8 w-8 text-[#FF4500]" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-[#001F3F] uppercase">
              Admin Portal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage your fishing apparel store
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all"
                  placeholder="admin@lapesqueria.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#001F3F] hover:bg-[#002D5C] focus:outline-none focus:ring-2 focus:ring-[#001F3F] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg uppercase tracking-wide"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Sign In to Admin Panel
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back to Store Link */}
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-[#001F3F] hover:text-[#FF4500] font-medium transition-colors"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
