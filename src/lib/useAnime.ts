'use client'

import { useEffect, useRef, RefObject } from 'react'
import anime from 'animejs'

export interface AnimeParams extends anime.AnimeParams {
  opacity?: number[]
  translateY?: number[]
  translateX?: number[]
  scale?: number[]
  duration?: number
  delay?: number | any
  ease?: string
  loop?: boolean
  alternate?: boolean
}

// Custom hook for anime.js animations
export function useAnimeOnView(
  params: AnimeParams,
  options?: { threshold?: number; once?: boolean }
) {
  const ref = useRef<HTMLElement>(null)
  const hasAnimated = useRef(false)
  const { threshold = 0.1, once = true } = options || {}

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (once && hasAnimated.current) return
          hasAnimated.current = true

          anime({
            targets: element,
            ...params
          })
        }
      },
      { threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [params, threshold, once])

  return ref
}

// Hook for staggered animations on children
export function useAnimeStagger(
  containerRef: RefObject<HTMLElement>,
  childSelector: string,
  params: AnimeParams,
  options?: { threshold?: number; once?: boolean }
) {
  const hasAnimated = useRef(false)
  const { threshold = 0.1, once = true } = options || {}

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const children = container.querySelectorAll(childSelector)
    if (children.length === 0) return

    // Set initial state
    children.forEach((child) => {
      if (child instanceof HTMLElement) {
        child.style.opacity = '0'
      }
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (once && hasAnimated.current) return
          hasAnimated.current = true

          anime({
            targets: children,
            opacity: [0, 1],
            ...params,
          })
        }
      },
      { threshold }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef, childSelector, params, threshold, once])
}

// Common animation presets
export const animePresets = {
  fadeInUp: {
    opacity: [0, 1],
    translateY: [30, 0],
    duration: 800,
    ease: 'outQuad',
  },
  fadeInDown: {
    opacity: [0, 1],
    translateY: [-30, 0],
    duration: 800,
    ease: 'outQuad',
  },
  fadeInLeft: {
    opacity: [0, 1],
    translateX: [-30, 0],
    duration: 800,
    ease: 'outQuad',
  },
  fadeInRight: {
    opacity: [0, 1],
    translateX: [30, 0],
    duration: 800,
    ease: 'outQuad',
  },
  scaleIn: {
    opacity: [0, 1],
    scale: [0.9, 1],
    duration: 600,
    ease: 'outBack',
  },
  staggerFadeUp: {
    opacity: [0, 1],
    translateY: [40, 0],
    duration: 600,
    delay: anime.stagger(100),
    ease: 'outQuad',
  },
  slideInFromBottom: {
    opacity: [0, 1],
    translateY: [100, 0],
    duration: 1000,
    ease: 'outExpo',
  },
  pulse: {
    scale: [1, 1.05, 1],
    duration: 800,
    ease: 'inOutQuad',
  },
  shimmer: {
    opacity: [0.5, 1, 0.5],
    duration: 1500,
    loop: true,
    ease: 'inOutSine',
  },
  bounce: {
    translateY: [0, -15, 0],
    duration: 600,
    ease: 'outBounce',
  },
  wave: {
    translateY: [0, -10, 0],
    duration: 1000,
    loop: true,
    delay: anime.stagger(100),
    ease: 'inOutSine',
  },
}

// Utility function for running animations imperatively
export function runAnime(target: Element | Element[] | NodeListOf<Element>, params: AnimeParams) {
  return anime({
    targets: target,
    ...params
  })
}

// Text animation utility
export function animateText(
  element: HTMLElement | null,
  options?: { delay?: number; staggerDelay?: number }
) {
  if (!element) return

  const text = element.textContent || ''
  element.textContent = ''

  // Wrap each character in a span
  const chars = text.split('').map((char) => {
    const span = document.createElement('span')
    span.textContent = char === ' ' ? '\u00A0' : char
    span.style.display = 'inline-block'
    span.style.opacity = '0'
    element.appendChild(span)
    return span
  })

  anime({
    targets: chars,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 600,
    delay: anime.stagger(30, { start: options?.delay || 0 }),
    ease: 'outQuad',
  })
}
