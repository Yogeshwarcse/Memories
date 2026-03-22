'use client'

import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion'
import { useState, useCallback, useEffect, useRef } from 'react'

interface ToyCharacterProps {
  onHit: () => void
  hitLevel: number
}

interface FloatingEmoji {
  id: number
  emoji: string
  x: number
  y: number
  scale: number
  rot: number
}

interface BloodDrop {
  id: number
  x: number
  yOffset: number
  delay: number
}

const EMOJIS = ['😤', '💥', '🔥', '👊', '💢', '🥊', '⚡', '🤕', '😵', '😡']

const CharacterSVG = ({
  isHitting,
  intensity,
  hitLevel,
  eyeTwitch,
  breathPhase,
  lookX,
  lookY,
  isHovered
}: {
  isHitting: boolean
  intensity: number
  hitLevel: number
  eyeTwitch: boolean
  breathPhase: number
  lookX: number
  lookY: number
  isHovered: boolean
}) => {
  const rage = Math.min(hitLevel / 30, 1)
  
  // Dynamic colors based on rage
  const skinR = 255 - rage * 35
  const skinG = 219 - rage * 119
  const skinB = 197 - rage * 157
  const skinColor = `rgb(${skinR}, ${skinG}, ${skinB})`
  const skinShadow = `rgb(${skinR - 60}, ${Math.max(skinG - 60, 0)}, ${Math.max(skinB - 60, 0)})`
  
  const bruiseColor = `hsl(${260 + rage * 20}, 40%, 45%)`
  const bruiseOpacity = Math.min(hitLevel * 0.05, 0.8)
  const sweatOpacity = Math.min(hitLevel * 0.05, 1)

  // 3D Lighting setup
  // Use light from top-left (dx: -10, dy: -10)
  
  // Head look offset
  const hx = lookX * 12
  const hy = lookY * 12

  // Arm positions reacting to hover and rage
  const armRaise = isHovered ? (rage > 0.5 ? 40 : 15) : 0
  
  return (
    <motion.svg
      viewBox="0 0 200 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-[0_15px_15px_rgba(0,0,0,0.35)] overflow-visible"
    >
      <defs>
        {/* 3D Gradients */}
        <radialGradient id="head3D" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="40%" stopColor={skinColor} />
          <stop offset="100%" stopColor={skinShadow} />
        </radialGradient>
        
        <radialGradient id="arm3D" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="50%" stopColor={skinColor} />
          <stop offset="100%" stopColor={skinShadow} />
        </radialGradient>

        <radialGradient id="hoodie3D" cx="40%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#FF4B4B" />
          <stop offset="60%" stopColor="#D62828" />
          <stop offset="100%" stopColor="#7A1010" />
        </radialGradient>

        <radialGradient id="pants3D" cx="30%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#005A8A" />
          <stop offset="50%" stopColor="#003049" />
          <stop offset="100%" stopColor="#001524" />
        </radialGradient>

        <radialGradient id="shoe3D" cx="30%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#FF9933" />
          <stop offset="50%" stopColor="#E06600" />
          <stop offset="100%" stopColor="#8A3E00" />
        </radialGradient>

        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF2200" stopOpacity={rage * 0.8} />
          <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
        </radialGradient>

        <filter id="shadow-blur">
          <feGaussianBlur stdDeviation="3" />
        </filter>

        {/* Inner shadow for 3D depth */}
        <filter id="inset-shadow">
          <feOffset dx="0" dy="0"/>
          <feGaussianBlur stdDeviation="4" result="offset-blur"/>
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
          <feFlood floodColor="black" floodOpacity="0.5" result="color"/>
          <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
          <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
        </filter>
      </defs>

      {/* ── GROUND SHADOW ── */}
      <motion.ellipse 
        cx="100" cy="310" 
        rx={38 + breathPhase * 2} ry="8" 
        fill="rgba(0,0,0,0.25)" 
        filter="url(#shadow-blur)" 
        animate={isHitting ? { rx: 30, opacity: 0.1 } : { rx: 38 + breathPhase * 2, opacity: 0.25 }}
      />

      {/* ── RIGHT ARM (behind body) ── */}
      <motion.g
        animate={
          isHitting
            ? { 
                rotate: [-150, -170, -140, -165, -160], 
                x: [-10, -20, -12, -18, -15], 
                y: [-20, -30, -22, -28, -25] 
              }
            : { rotate: 18 + breathPhase * 2 - armRaise, x: 0, y: breathPhase * 1.5 - armRaise * 0.5 }
        }
        transition={isHitting ? { duration: 0.3, times: [0, 0.2, 0.5, 0.8, 1], ease: 'backOut' } : { type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformOrigin: '138px 118px' }}
        filter="url(#inset-shadow)"
      >
        <rect x="130" y="112" width="22" height="44" rx="11" fill="url(#hoodie3D)" />
        <rect x="132" y="148" width="18" height="36" rx="9" fill="url(#arm3D)" />
        <rect x="131" y="178" width="20" height="24" rx="10" fill="url(#arm3D)" />
        <line x1="134" y1="184" x2="149" y2="184" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
        <line x1="134" y1="189" x2="149" y2="189" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
      </motion.g>

      {/* ── RIGHT LEG ── */}
      <motion.g
        animate={
          isHitting
            ? { 
                rotate: [20, 35, 15, 30, 25], 
                y: [-10, -20, -12, -18, -15], 
                x: [5, 12, 4, 10, 8] 
              }
            : { rotate: 4 + breathPhase * 1, y: breathPhase * 0.5, x: 0 }
        }
        transition={isHitting ? { duration: 0.3, times: [0, 0.25, 0.5, 0.75, 1], ease: 'backOut' } : { duration: 0.4 }}
        style={{ transformOrigin: '116px 200px' }}
        filter="url(#inset-shadow)"
      >
        <rect x="107" y="192" width="24" height="54" rx="12" fill="url(#pants3D)" />
        <ellipse cx="119" cy="242" rx="13" ry="11" fill="#001524" />
        <rect x="107" y="240" width="24" height="46" rx="10" fill="url(#pants3D)" />
        {/* Shoe */}
        <path d="M 104 276 Q 118 270 132 276 L 132 294 Q 118 296 104 294 Z" fill="url(#shoe3D)" rx="5" />
        <path d="M 104 288 Q 118 292 132 288" stroke="#FFF" strokeWidth="3" fill="none" opacity="0.8" />
      </motion.g>

      {/* ── LEFT LEG ── */}
      <motion.g
        animate={
          isHitting
            ? { 
                rotate: [-20, -35, -15, -30, -25], 
                y: [-20, -30, -22, -28, -25], 
                x: [-8, -15, -6, -12, -10] 
              }
            : { rotate: -4 + breathPhase * 1, y: breathPhase * 0.5, x: 0 }
        }
        transition={isHitting ? { duration: 0.3, times: [0, 0.25, 0.5, 0.75, 1], ease: 'backOut' } : { duration: 0.4 }}
        style={{ transformOrigin: '84px 200px' }}
        filter="url(#inset-shadow)"
      >
        <rect x="69" y="192" width="24" height="54" rx="12" fill="url(#pants3D)" />
        <ellipse cx="81" cy="242" rx="13" ry="11" fill="#001524" />
        <rect x="69" y="240" width="24" height="46" rx="10" fill="url(#pants3D)" />
        {/* Shoe */}
        <path d="M 66 276 Q 80 270 94 276 L 94 294 Q 80 296 66 294 Z" fill="url(#shoe3D)" />
        <path d="M 66 288 Q 80 292 94 288" stroke="#FFF" strokeWidth="3" fill="none" opacity="0.8" />
      </motion.g>

      {/* ── TORSO ── */}
      <motion.g
        animate={
          isHitting
            ? { rotate: -18, y: -18, scaleX: 0.94, scaleY: 1.05 }
            : { rotate: 0, y: breathPhase * 1.5 - (isHovered ? 4 : 0), scaleX: 1 + breathPhase * 0.02, scaleY: 1 - breathPhase * 0.02 }
        }
        transition={isHitting ? { type: 'spring', stiffness: 600, damping: 20 } : { type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformOrigin: '100px 155px' }}
      >
        <rect x="60" y="108" width="80" height="100" rx="24" fill="url(#hoodie3D)" filter="url(#inset-shadow)" />
        {/* Drawstrings moving physically */}
        <motion.path 
          d={`M 92 116 Q 88 135 ${86 + breathPhase} 155`} 
          stroke="#FFE0C0" strokeWidth="3" strokeLinecap="round" fill="none" 
          animate={isHitting ? { d: 'M 92 116 Q 70 130 80 160' } : {}}
        />
        <motion.path 
          d={`M 108 116 Q 112 135 ${114 - breathPhase} 155`} 
          stroke="#FFE0C0" strokeWidth="3" strokeLinecap="round" fill="none" 
          animate={isHitting ? { d: 'M 108 116 Q 130 130 120 160' } : {}}
        />
        {/* Pocket */}
        <path d="M 70 162 Q 100 152 130 162 L 130 196 Q 100 208 70 196 Z" fill="#901010" filter="url(#inset-shadow)" />
        <path d="M 100 162 L 100 202" stroke="#600" strokeWidth="2" opacity="0.5" />
      </motion.g>

      {/* ── HEAD ── */}
      <motion.g
        animate={
          isHitting
            ? { rotate: -35, x: -18, y: -30, scaleX: 1.1, scaleY: 0.9 } // Squash and stretch
            : {
                rotate: (eyeTwitch ? -3 : 0) + lookX * 10,
                x: hx - (isHovered ? 2 : 0),
                y: hy + breathPhase * 1.5 - (isHovered ? 6 : 0),
                scaleX: 1, scaleY: 1
              }
        }
        transition={isHitting ? { type: 'spring', stiffness: 700, damping: 14 } : { type: 'spring', stiffness: 300, damping: 25 }}
        style={{ transformOrigin: '100px 80px' }}
      >
        {/* Neck */}
        <rect x="86" y="82" width="28" height="36" rx="14" fill="url(#arm3D)" />
        
        {/* Ears */}
        <ellipse cx="58" cy="64" rx="10" ry="14" fill="url(#head3D)" />
        <ellipse cx="59" cy="64" rx="5" ry="9" fill="#000" opacity="0.15" />
        <ellipse cx="142" cy="64" rx="10" ry="14" fill="url(#head3D)" />
        <ellipse cx="141" cy="64" rx="5" ry="9" fill="#000" opacity="0.15" />

        {/* Face base */}
        <ellipse cx="100" cy="60" rx="42" ry="46" fill="url(#head3D)" filter="url(#inset-shadow)" />

        {/* Bruise */}
        <ellipse cx="80" cy="56" rx="18" ry="14" fill={bruiseColor} opacity={bruiseOpacity} filter="url(#shadow-blur)" />
        
        {/* Cheeks */}
        <ellipse cx="74" cy="74" rx="12" ry="8" fill={`rgba(255,50,50,${0.15 + rage * 0.4})`} filter="url(#shadow-blur)" />
        <ellipse cx="126" cy="74" rx="12" ry="8" fill={`rgba(255,50,50,${0.15 + rage * 0.4})`} filter="url(#shadow-blur)" />

        {/* ── HAIR (More voluminous) ── */}
        <path d="M 58 44 C 58 -15 142 -15 142 44 C 142 25 58 25 58 44 Z" fill="#151515" />
        <path d="M 58 44 Q 46 68 53 84 Q 65 48 58 44" fill="#151515" />
        <path d="M 142 44 Q 154 68 147 84 Q 135 48 142 44" fill="#151515" />
        <path d="M 72 14 Q 90 4 105 10 Q 90 18 78 24 Z" fill="#333" filter="url(#shadow-blur)" />
        <path d="M 85 18 C 75 35 80 50 88 54" stroke="#111" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* ── SWEAT ── */}
        <motion.g opacity={sweatOpacity}>
          <motion.ellipse cx="134" cy="40" rx="4" ry="7" fill="#AADDFF"
            animate={{ y: [0, 10, 0], opacity: [0.9, 0.4, 0.9] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.1 }} />
          <motion.ellipse cx="66" cy="45" rx="3.5" ry="6" fill="#AADDFF"
            animate={{ y: [0, 8, 0], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: 0.5 }} />
        </motion.g>

        {/* ── EXPRESSIONS ── */}
        {isHitting ? (
          <g>
            <ellipse cx="80" cy="58" rx="12" ry="11" fill="#FFF" />
            <ellipse cx="120" cy="58" rx="12" ry="11" fill="#FFF" />
            
            {/* X Eyes */}
            <path d="M 72 50 L 88 66 M 88 50 L 72 66" stroke="#111" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 112 50 L 128 66 M 128 50 L 112 66" stroke="#111" strokeWidth="4.5" strokeLinecap="round" />
            
            <ellipse cx="80" cy="58" rx="12" ry="12" fill="url(#eyeGlow)" filter="url(#shadow-blur)" />
            <ellipse cx="120" cy="58" rx="12" ry="12" fill="url(#eyeGlow)" filter="url(#shadow-blur)" />

            {/* Yelling Mouth (3D depth) */}
            <path d="M 82 80 Q 100 70 118 80 L 115 100 Q 100 110 85 100 Z" fill="#4A0000" />
            <path d="M 82 80 Q 100 70 118 80 L 116 86 Q 100 78 84 86 Z" fill="#FFF" />
            <ellipse cx="100" cy="98" rx="10" ry="7" fill="#E63946" />

            {/* Vein */}
            <path d="M 90 28 Q 95 22 100 26 Q 105 30 100 36" stroke={`rgba(150,0,0,${rage})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g>
            {/* Eye whites */}
            <ellipse cx="82" cy="58" rx="11" ry="10" fill="#FFF" />
            <ellipse cx="118" cy="58" rx="11" ry="10" fill="#FFF" />

            {/* Irises tracking mouse */}
            <motion.g animate={eyeTwitch ? { scaleY: 0.1 } : { scaleY: 1 }} style={{ transformOrigin: '82px 58px' }}>
              <ellipse cx={82 + lookX * 4} cy={58 + lookY * 4} rx="7.5" ry="7.5" fill={`hsl(${210 - rage * 70}, 70%, 30%)`} />
              <circle cx={82 + lookX * 4} cy={58 + lookY * 4} r="4.5" fill="#050505" />
              <circle cx={84 + lookX * 4} cy={55 + lookY * 4} r="2" fill="#FFF" />
            </motion.g>

            <motion.g animate={eyeTwitch ? { scaleY: 0.1 } : { scaleY: 1 }} style={{ transformOrigin: '118px 58px' }}>
              <ellipse cx={118 + lookX * 4} cy={58 + lookY * 4} rx="7.5" ry="7.5" fill={`hsl(${210 - rage * 70}, 70%, 30%)`} />
              <circle cx={118 + lookX * 4} cy={58 + lookY * 4} r="4.5" fill="#050505" />
              <circle cx={120 + lookX * 4} cy={55 + lookY * 4} r="2" fill="#FFF" />
            </motion.g>

            {/* Angry vs Normal Eyebrows */}
            <motion.path
              d={rage > 0.4 || isHovered ? "M 70 45 Q 83 38 95 45" : "M 70 45 Q 83 40 95 45"}
              stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" fill="none"
              animate={isHovered ? { y: 2 } : { y: 0 }}
            />
            <motion.path
              d={rage > 0.4 || isHovered ? "M 105 45 Q 117 38 130 45" : "M 105 45 Q 117 40 130 45"}
              stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" fill="none"
              animate={isHovered ? { y: 2 } : { y: 0 }}
            />

            {/* Nose */}
            <path d="M 96 66 Q 92 73 95 78 Q 100 82 105 78 Q 108 73 104 66" stroke="rgba(0,0,0,0.2)" strokeWidth="2" fill="none" strokeLinecap="round" />
            
            {/* Mouth */}
            <motion.path
              d={rage > 0.6 ? "M 86 86 Q 100 90 114 86" : (isHovered ? "M 88 88 Q 100 85 112 88" : "M 86 84 Q 100 96 114 84")}
              stroke="#8B4040"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {rage < 0.3 && !isHovered && (
              <path d="M 92 86 Q 100 92 108 86 L 108 90 Q 100 96 92 90 Z" fill="rgba(255,255,255,0.8)" />
            )}
          </g>
        )}
      </motion.g>

      {/* ── LEFT ARM (front) ── */}
      <motion.g
        animate={
          isHitting
            ? { 
                rotate: [150, 170, 140, 165, 160], 
                x: [-12, -22, -14, -20, -16], 
                y: [-20, -30, -22, -28, -25] 
              }
            : { rotate: -14 + breathPhase * 2 + armRaise, x: 0, y: breathPhase * 1.5 - armRaise * 0.5 }
        }
        transition={isHitting ? { duration: 0.3, times: [0, 0.2, 0.5, 0.8, 1], ease: 'backOut' } : { type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformOrigin: '62px 118px' }}
        filter="url(#inset-shadow)"
      >
        <rect x="48" y="112" width="24" height="44" rx="12" fill="url(#hoodie3D)" />
        <rect x="50" y="148" width="20" height="38" rx="10" fill="url(#arm3D)" />
        <rect x="49" y="180" width="22" height="24" rx="11" fill="url(#arm3D)" />
        <line x1="52" y1="186" x2="69" y2="186" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
        <line x1="52" y1="191" x2="69" y2="191" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
        {/* Thumb */}
        <ellipse cx="46" cy="188" rx="6" ry="9" fill="url(#arm3D)" />
      </motion.g>
    </motion.svg>
  )
}

export function ToyCharacter({ onHit, hitLevel }: ToyCharacterProps) {
  const [isHitting, setIsHitting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  const [bloodDrops, setBloodDrops] = useState<BloodDrop[]>([])
  const [eyeTwitch, setEyeTwitch] = useState(false)
  const [breathPhase, setBreathPhase] = useState(0)
  
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const twitchRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse tracking physics
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const lookXSpring = useSpring(mouseX, springConfig)
  const lookYSpring = useSpring(mouseY, springConfig)

  // Breathing cycle
  useEffect(() => {
    let t = 0
    breathRef.current = setInterval(() => {
      t += 0.05
      setBreathPhase(Math.sin(t) * (1 + Math.min(hitLevel * 0.04, 2.5)))
    }, 50)
    return () => clearInterval(breathRef.current!)
  }, [hitLevel])

  // Eye twitch
  useEffect(() => {
    const interval = Math.max(3500 - hitLevel * 100, 500)
    twitchRef.current = setInterval(() => {
      setEyeTwitch(true)
      setTimeout(() => setEyeTwitch(false), 120)
    }, interval)
    return () => clearInterval(twitchRef.current!)
  }, [hitLevel])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    // Calculate normalized position -1 to 1
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleClick = useCallback(() => {
    setIsHitting(true)
    onHit()

    const newEmoji: FloatingEmoji = {
      id: Date.now(),
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 140 - 70,
      y: Math.random() * -100 - 80,
      scale: Math.random() * 1.5 + 1.5,
      rot: Math.random() * 80 - 40
    }
    setFloatingEmojis(prev => [...prev.slice(-15), newEmoji])

    // Blood splatters
    if (hitLevel > 5) {
      const dropsCount = Math.min(Math.floor(hitLevel / 8) + 1, 5)
      const newDrops = Array.from({ length: dropsCount }).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        yOffset: Math.random() * 40 - 20,
        delay: Math.random() * 0.15,
      }))
      setBloodDrops(prev => [...prev.slice(-15), ...newDrops])
      setTimeout(() => setBloodDrops(prev => prev.filter(d => !newDrops.find(n => n.id === d.id))), 1200)
    }

    // Fast reset with squash physics overlap
    setTimeout(() => setIsHitting(false), 200)
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id)), 1200)
  }, [onHit, hitLevel])

  const shakeIntensity = Math.min(hitLevel * 0.8, 18)
  const rage = Math.min(hitLevel / 30, 1)

  return (
    <div 
      className="relative flex flex-col items-center justify-center py-12"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative cursor-pointer select-none touch-none" onClick={handleClick}
           style={{ WebkitTapHighlightColor: 'transparent' }}>

        {/* Dynamic Rage Aura */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none -z-10"
          animate={{
            boxShadow: rage > 0.15
              ? `0 0 ${rage * 100}px ${rage * 50}px rgba(220,10,10,${rage * 0.4})`
              : '0 0 0px 0px transparent',
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Emojis */}
        <AnimatePresence>
          {floatingEmojis.map(emoji => (
            <motion.span
              key={emoji.id}
              initial={{ opacity: 1, y: 0, x: 0, scale: 0.5, rotate: 0 }}
              animate={{ opacity: 0, y: emoji.y, x: emoji.x, scale: emoji.scale, rotate: emoji.rot }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute top-12 left-1/2 -translate-x-1/2 text-4xl pointer-events-none z-30 drop-shadow-lg"
            >
              {emoji.emoji}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Blood Particles */}
        <AnimatePresence>
          {bloodDrops.map(drop => (
            <motion.div
              key={drop.id}
              className="absolute top-16 left-1/2 pointer-events-none z-20"
              initial={{ x: drop.x, y: drop.yOffset, opacity: 1, scale: 1.5 + Math.random() }}
              animate={{ y: drop.yOffset + 100 + Math.random() * 50, opacity: 0, scale: 0.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeIn', delay: drop.delay }}
            >
              <div className="w-2.5 h-4 bg-red-700 rounded-full blur-[0.5px]" style={{ borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%' }} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Interactive Character Container */}
        <motion.div
          animate={
            isHitting
              ? {
                  x: [0, -shakeIntensity, shakeIntensity * 0.9, -shakeIntensity * 0.6, shakeIntensity * 0.3, 0],
                  y: [0, -15, 8, -5, 2, 0], // more vertical exaggeration
                  scale: [1, 0.85, 1.15, 0.95, 1.02, 1], // squash and stretch
                  rotate: [0, -8, 7, -4, 2, 0],
                }
              : {
                  y: [0, -6 - rage * 5, 0],
                  scale: isHovered ? [1, 1.02, 1] : 1, // slight heartbeat scaling on hover
                }
          }
          transition={
            isHitting
              ? { duration: 0.3, times: [0, 0.15, 0.35, 0.6, 0.8, 1], ease: 'backOut' }
              : { duration: 2.2 - rage * 0.8, repeat: Infinity, ease: 'easeInOut' }
          }
          className="relative w-72 h-80 md:w-96 md:h-[26rem] will-change-transform"
        >
          {/* Ground Impact FX */}
          {isHitting && rage > 0.3 && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 rounded-full border-4 border-red-500/30 -z-10 blur-sm"
            />
          )}

          <CharacterSVG
            isHitting={isHitting}
            intensity={shakeIntensity}
            hitLevel={hitLevel}
            eyeTwitch={eyeTwitch}
            breathPhase={breathPhase}
            lookX={lookXSpring.get()}
            lookY={lookYSpring.get()}
            isHovered={isHovered}
          />
        </motion.div>
      </div>
    </div>
  )
}
