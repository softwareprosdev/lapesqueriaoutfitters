'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface BlogContentEnhancerProps {
  children: React.ReactNode
  title: string
  featuredImage?: string
  category?: string | null | undefined
}

export function BlogContentEnhancer({ 
  children, 
  title, 
  featuredImage, 
  category 
}: BlogContentEnhancerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {/* Background Image/Gradient */}
        <div className="absolute inset-0 bg-slate-900">
          {featuredImage ? (
            <>
              <Image
                src={featuredImage}
                alt={title}
                fill
                className="object-cover opacity-60"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-blue-900 to-slate-900" />
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className={`max-w-4xl w-full text-center transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="flex items-center gap-3 mb-6 justify-center flex-wrap">
              {category && (
                <span className="bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-100 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
                  {category}
                </span>
              )}
              <span className="text-slate-300 text-sm font-medium tracking-wide">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric', 
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 -mt-32 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Article Content */}
          <div className="lg:col-span-8">
            <article className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/40">
              <div 
                className={`prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl transition-all duration-1000 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                {children}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              
              {/* Navigation Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-white/40">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🧭</span> Explore
                </h3>
                <nav className="space-y-1">
                  <Link href="#conservation" className="block px-3 py-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-all font-medium">
                    Conservation Focus
                  </Link>
                  <Link href="#research" className="block px-3 py-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-all font-medium">
                    Research & Science
                  </Link>
                  <Link href="#impact" className="block px-3 py-2 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-all font-medium">
                    Impact Stories
                  </Link>
                </nav>
              </div>

              {/* Impact Card */}
              <div className="bg-gradient-to-br from-teal-600 to-blue-700 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] mix-blend-overlay" />
                
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                  <span className="text-xl">🌊</span> Conservation Impact
                </h3>
                
                <div className="relative z-10 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2 text-teal-100">
                      <span>Funded by Purchases</span>
                      <span className="font-bold">75%</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                      <div 
                        className="h-full bg-teal-300 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: '75%' }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-teal-100 leading-relaxed">
                    Your bracelet purchase directly supports Sea Turtle Inc. rehabilitation programs.
                  </p>

                  <Link 
                    href="/products" 
                    className="block w-full text-center bg-white text-teal-700 py-3 rounded-xl font-bold hover:bg-teal-50 transition-colors shadow-lg"
                  >
                    Shop to Support
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-slate-900 border-t border-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Conservation Impact Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-slate-300">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-4xl mb-3">🐢</div>
              <div className="font-semibold text-white">Sea Turtles</div>
              <div className="text-sm mt-1 text-slate-400">Rescue & Rehab</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-4xl mb-3">🐋</div>
              <div className="font-semibold text-white">Marine Life</div>
              <div className="text-sm mt-1 text-slate-400">Research Programs</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-4xl mb-3">🌏</div>
              <div className="font-semibold text-white">Ecosystems</div>
              <div className="text-sm mt-1 text-slate-400">Habitat Protection</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}