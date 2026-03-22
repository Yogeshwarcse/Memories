'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Heart {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  isFilled: boolean
}

export function HeartsBackground() {
  const [hearts, setHearts] = useState<Heart[]>([])

  useEffect(() => {
    // Generate initial hearts
    const initialHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 110, // Start below the screen
      size: Math.random() * 20 + 10,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 10,
      isFilled: Math.random() > 0.5
    }))
    setHearts(initialHearts)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20 select-none">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ y: '110vh', x: `${heart.x}vw`, opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{
            y: '-20vh',
            opacity: [0, 0.4, 0.4, 0],
            scale: [0.5, 1, 1.2, 0.8],
            rotate: [0, 45, -45, 90],
            x: [`${heart.x}vw`, `${heart.x + (Math.random() * 10 - 5)}vw`]
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: 'linear'
          }}
          style={{ position: 'absolute' }}
        >
          <svg
            width={heart.size}
            height={heart.size}
            viewBox="0 0 24 24"
            fill={heart.isFilled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/20"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}
