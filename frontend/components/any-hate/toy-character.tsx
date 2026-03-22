'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'

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

const CharacterSVG = ({ isHitting, intensity }: { isHitting: boolean, intensity: number }) => {
  return (
    <motion.svg 
      viewBox="0 0 200 300" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="w-full h-full drop-shadow-2xl overflow-visible"
    >
      {/* --- RIGHT ARM (Behind body) --- */}
      <motion.g
        initial={false}
        animate={isHitting ? { rotate: -140, x: -10, y: -20 } : { rotate: 20, x: 0, y: 0 }}
        style={{ transformOrigin: '140px 120px' }}
      >
        <rect x="130" y="115" width="20" height="70" rx="10" fill="#D62828" /> {/* Sleeve */}
        <rect x="132" y="170" width="16" height="30" rx="8" fill="#FFBFA3" /> {/* Hand */}
      </motion.g>

      {/* --- RIGHT LEG --- */}
      <motion.g
        initial={false}
        animate={isHitting ? { rotate: 20, y: -10 } : { rotate: 5, y: 0 }}
        style={{ transformOrigin: '115px 200px' }}
      >
        <rect x="105" y="190" width="22" height="90" rx="10" fill="#003049" /> {/* Pant */}
        <rect x="105" y="270" width="26" height="15" rx="7" fill="#F77F00" /> {/* Shoe */}
      </motion.g>

      {/* --- LEFT LEG --- */}
      <motion.g
        initial={false}
        animate={isHitting ? { rotate: -20, y: -20, x: -10 } : { rotate: -5, y: 0, x: 0 }}
        style={{ transformOrigin: '85px 200px' }}
      >
        <rect x="75" y="190" width="22" height="90" rx="10" fill="#003049" /> {/* Pant */}
        <rect x="71" y="270" width="26" height="15" rx="7" fill="#F77F00" /> {/* Shoe */}
      </motion.g>

      {/* --- TORSO --- */}
      <motion.g
        initial={false}
        animate={isHitting ? { rotate: -15, y: -15 } : { rotate: 0, y: 0 }}
        style={{ transformOrigin: '100px 150px' }}
      >
        <rect x="65" y="110" width="70" height="95" rx="20" fill="#D62828" /> {/* Hoodie */}
        {/* Drawstrings */}
        <path d="M 90 120 L 90 150 M 110 120 L 110 150" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
        {/* Pocket */}
        <path d="M 75 160 Q 100 150 125 160 L 125 190 Q 100 200 75 190 Z" fill="#BA1826" />
      </motion.g>

      {/* --- HEAD --- */}
      <motion.g
        initial={false}
        animate={isHitting ? { rotate: -25, x: -10, y: -25 } : { rotate: 0, x: 0, y: 0 }}
        style={{ transformOrigin: '100px 100px' }}
      >
        {/* Neck */}
        <rect x="90" y="80" width="20" height="40" rx="10" fill="#FFBFA3" />
        {/* Face */}
        <ellipse cx="100" cy="65" rx="35" ry="40" fill="#FFBFA3" />
        {/* Hair shape */}
        <path d="M 60 50 C 60 0 140 0 140 50 C 140 35 60 35 60 50 Z" fill="#212529" />
        <path d="M 65 50 Q 55 70 60 80 Q 70 50 65 50" fill="#212529" />
        <path d="M 135 50 Q 145 70 140 80 Q 130 50 135 50" fill="#212529" />

        {isHitting ? (
          <g>
            {/* Hurt Eyes >< */}
            <path d="M 75 55 L 85 62 L 75 69" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 125 55 L 115 62 L 125 69" stroke="#111" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Yelling Mouth */}
            <ellipse cx="100" cy="82" rx="12" ry="16" fill="#900" />
            {/* Teeth */}
            <path d="M 88 82 Q 100 87 112 82" stroke="#FFF" strokeWidth="5" />
            
            {/* Sweat drop / Action marks */}
            <path d="M 135 30 L 145 20 M 140 35 L 155 30" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            {/* Normal Eyes */}
            <circle cx="85" cy="60" r="5" fill="#111" />
            <circle cx="115" cy="60" r="5" fill="#111" />
            
            {/* Smirk / Smile */}
            <path d="M 90 80 Q 100 90 110 80" stroke="#111" strokeWidth="3" strokeLinecap="round" />
            <path d="M 110 80 L 112 75" stroke="#111" strokeWidth="3" strokeLinecap="round" /> {/* Smirk line */}
          </g>
        )}
      </motion.g>

      {/* --- LEFT ARM (Front) --- */}
      <motion.g
        initial={false}
        animate={isHitting ? { rotate: 140, x: -10, y: -20 } : { rotate: -15, x: 0, y: 0 }}
        style={{ transformOrigin: '60px 120px' }}
      >
        <rect x="50" y="115" width="20" height="70" rx="10" fill="#D62828" /> {/* Sleeve */}
        <rect x="52" y="170" width="16" height="30" rx="8" fill="#FFBFA3" /> {/* Hand */}
      </motion.g>
    </motion.svg>
  );
}

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
    setTimeout(() => setIsHitting(false), 150)
    
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
          <CharacterSVG isHitting={isHitting} intensity={shakeIntensity} />
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
