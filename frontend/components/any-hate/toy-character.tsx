'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import Image from 'next/image'

interface ToyCharacterProps {
  onHit: () => void
  hitLevel: number
}

interface FloatingEmoji {
  id: number
  emoji: string
  x: number
  y: number
}

const EMOJIS = ['😤', '💥', '🔥', '👊', '💢', '🥊']

export function ToyCharacter({ onHit, hitLevel }: ToyCharacterProps) {
  const [isHitting, setIsHitting] = useState(false)
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])

  const handleClick = useCallback(() => {
    setIsHitting(true)
    onHit()
    
    // Create floating emoji
    const newEmoji: FloatingEmoji = {
      id: Date.now(),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 100 - 50, // random offset
      y: Math.random() * -100 - 50, // floating up
    }
    
    setFloatingEmojis(prev => [...prev.slice(-10), newEmoji])
    
    // Reset hit state
    setTimeout(() => setIsHitting(false), 100)
    
    // Remove emoji after animation
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id))
    }, 1000)
  }, [onHit])

  // Intensity increases with hitLevel
  const shakeIntensity = Math.min(hitLevel * 0.5, 10)

  return (
    <div className="relative flex flex-col items-center justify-center py-12">
      <div className="relative cursor-pointer select-none touch-none" onClick={handleClick}>
        {/* Floating Emojis */}
        <AnimatePresence>
          {floatingEmojis.map(emoji => (
            <motion.span
              key={emoji.id}
              initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              animate={{ opacity: 0, y: emoji.y, x: emoji.x, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-3xl pointer-events-none z-20"
            >
              {emoji.emoji}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* The Toy Character */}
        <motion.div
          animate={isHitting ? {
            x: [0, -shakeIntensity, shakeIntensity, -shakeIntensity, 0],
            scale: [1, 0.9, 1.1, 1],
            rotate: [0, -5, 5, -5, 0]
          } : {
            y: [0, -10, 0], // Idle bounce
          }}
          transition={isHitting ? {
            duration: 0.2,
            times: [0, 0.2, 0.4, 0.6, 1]
          } : {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-64 h-64 md:w-80 md:h-80"
        >
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10" />
          <Image
            src="/assets/any-hate/toy.png"
            alt="Hit me!"
            fill
            className="object-contain pointer-events-none drop-shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Shadow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.1, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-32 h-4 bg-foreground/20 rounded-[100%] blur-md mt-4"
      />
    </div>
  )
}
