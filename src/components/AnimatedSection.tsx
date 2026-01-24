'use client'

import { ReactNode, CSSProperties, useRef, useEffect, useState } from 'react'
import { 
  motion, 
  useScroll, 
  useTransform, 
  useInView, 
  useSpring, 
  Variants 
} from 'framer-motion'

interface AnimatedSectionProps {
  children: ReactNode
  animation?:
    | 'fadeInUp'
    | 'fadeInDown'
    | 'fadeInLeft'
    | 'fadeInRight'
    | 'scaleIn'
    | 'slideInFromBottom'
    | 'bounce'
  delay?: number
  duration?: number
  className?: string
  style?: CSSProperties
  once?: boolean
  threshold?: number
}

const animationVariants: Record<string, Variants> = {
  fadeInUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  slideInFromBottom: {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0 },
  },
  bounce: {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", bounce: 0.6 }
    },
  },
}

export default function AnimatedSection({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 800,
  className = '',
  style,
  once = true,
  threshold = 0.1,
}: AnimatedSectionProps) {
  // Convert duration from ms to seconds for framer-motion
  const durationInSeconds = duration / 1000
  const delayInSeconds = delay / 1000

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={animationVariants[animation]}
      transition={{ 
        duration: durationInSeconds, 
        delay: delayInSeconds,
        ease: "easeOut" 
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// Staggered children animation component
interface StaggeredChildrenProps {
  children: ReactNode
  className?: string
  childClassName?: string
  staggerDelay?: number
  duration?: number
  once?: boolean
  threshold?: number
}

export function StaggeredChildren({
  children,
  className = '',
  // childClassName is not strictly needed with framer-motion if using direct children,
  // but kept for API compatibility. We'll wrap children in motion.div instead.
  childClassName = 'stagger-child', 
  staggerDelay = 100,
  duration = 600,
  once = true,
  threshold = 0.1,
}: StaggeredChildrenProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay / 1000,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration / 1000,
        ease: "easeOut" as const
      }
    },
  }

  // To make this work with arbitrary children without requiring them to be motion components,
  // we use a motion.div wrapper that handles the orchestration.
  // Note: For 'staggerChildren' to work effectively, direct children should be motion components.
  // However, since we can't easily change all children in the usage code, 
  // the `AnimatedSection` usage in the codebase implies `stagger-child` class is used.
  // With framer-motion, the best way to stagger arbitrary children is to stagger the container
  // and have children variants. 
  // Since we can't inject variants into children automatically if they are plain HTML/React components,
  // we might need to rely on the fact that this component is likely wrapping a map loop.
  
  // A robust way to handle "arbitrary children" staggering without changing children code
  // is to use `AnimatePresence` or just `whileInView` on the container.
  // But standard StaggeredChildren usually implies the parent controls the timing.
  
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={containerVariants}
    >
      {/* 
        We map children to wrap them in motion.div to ensure they can be staggered.
        This changes the DOM structure slightly (adds a div wrapper), but usually safe.
      */}
      {Array.isArray(children) ? children.map((child, i) => (
        <motion.div key={i} variants={itemVariants} className={childClassName}>
          {child}
        </motion.div>
      )) : (
        <motion.div variants={itemVariants} className={childClassName}>
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}

// Floating animation component
interface FloatingElementProps {
  children: ReactNode
  className?: string
  amplitude?: number
  duration?: number
}

export function FloatingElement({
  children,
  className = '',
  amplitude = 10,
  duration = 3000,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [amplitude, -amplitude] }}
      transition={{
        duration: duration / 1000,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}

// Parallax scroll component
interface ParallaxElementProps {
  children: ReactNode
  className?: string
  speed?: number
}

export function ParallaxElement({
  children,
  className = '',
  speed = 0.5,
}: ParallaxElementProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  // Map scroll progress (0 to 1) to transform values
  // We use a simple approximation: -100px to 100px scaled by speed
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}

// Counter animation component
interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  
  const springValue = useSpring(0, {
    duration: duration, 
    bounce: 0
  })
  
  // Trigger animation when in view
  useEffect(() => {
    if (inView) {
      springValue.set(end)
    }
  }, [inView, end, springValue])

  // Update text content directly for performance
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return () => unsubscribe()
  }, [springValue])

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}