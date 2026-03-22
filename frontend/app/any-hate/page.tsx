'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Angry, RefreshCw, Trophy, Zap } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { PageHeader } from '@/components/page-header'
import { ToyCharacter } from '@/components/any-hate/toy-character'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/lib/api-config'

const CHECKIN_QUESTIONS = [
  "Are you fine now? 😊",
  "Feeling any better? 🧡",
  "Did that help let it out?",
  "Breathe in, breathe out... better? 🍃",
  "Is the stress fading away?",
  "Let it all out! You're safe here.",
  "Still mad? Give me another 10!",
  "Wow, you really went for it! You okay?",
  "Hope you're smiling now! ✨",
  "That looked like it hurt... me! Better now?"
]

export default function AnyHatePage() {
  const [hits, setHits] = useState<number>(0)
  const [sessionHits, setSessionHits] = useState<number>(0)
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load hits from Backend
  useEffect(() => {
    const fetchHits = async () => {
      try {
        const fullUrl = `${API_BASE_URL}/api/hate`
        console.log('Fetching hits from:', fullUrl)
        const response = await fetch(fullUrl)
        const data = await response.json()
        if (data && typeof data.count === 'number') {
          setHits(data.count)
        }
      } catch (err) {
        console.error('Failed to fetch global hits:', err)
        // Fallback to localStorage if backend fails
        const savedHits = localStorage.getItem('any-hate-hits')
        if (savedHits) setHits(parseInt(savedHits, 10))
      } finally {
        setIsLoading(false)
      }
    }
    fetchHits()
  }, [])

  const handleHit = async () => {
    // Optimistic update
    const newSessionHits = sessionHits + 1
    
    setHits(prev => prev + 1)
    setSessionHits(newSessionHits)
    
    // Persist to Backend
    try {
      fetch(`${API_BASE_URL}/api/hate/hit`, { method: 'POST' })
    } catch (err) {
      console.error('Failed to sync hit with backend')
    }
    
    // Persist to LocalStorage as backup
    localStorage.setItem('any-hate-hits', (hits + 1).toString())
    
    // Check-in questions every 10 hits
    if (newSessionHits > 0 && newSessionHits % 10 === 0) {
      const q = CHECKIN_QUESTIONS[Math.floor(Math.random() * CHECKIN_QUESTIONS.length)]
      setCurrentQuestion(q)
      
      setTimeout(() => setCurrentQuestion(null), 4000)
    }

    // Fun milestone toasts
    if (newSessionHits === 10) toast.info('Getting faster! 😤')
    if (newSessionHits === 50) toast.success('You are on fire! 🔥')
    if (newSessionHits === 100) toast.success('LEGENDARY STRESS RELIEF! 👑')
  }

  const handleReset = async () => {
    if (confirm('Reset the global stress level? This will clear hits for everyone.')) {
      setHits(0)
      setSessionHits(0)
      localStorage.setItem('any-hate-hits', '0')
      try {
        await fetch(`${API_BASE_URL}/api/hate/reset`, { method: 'POST' })
        toast.success('Hits reset!')
      } catch (err) {
        toast.error('Failed to reset backend counter')
      }
    }
  }

  const hitLevel = Math.floor(hits / 10)

  return (
    <div className="min-h-screen gradient-soft overflow-hidden">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16 relative">
        <PageHeader 
          title="Any Hate 😤"
          subtitle="Tap away your stress!"
          icon={Angry}
        />

        <div className="max-w-2xl mx-auto">
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -ml-16 -mb-16" />

            {/* Score Display */}
            <div className="text-center mb-8 relative z-10">
              <motion.div
                key={hits}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-3xl bg-primary/10 border border-primary/20"
              >
                <Zap className={`h-6 w-6 text-primary ${hits > 0 ? 'animate-pulse' : ''}`} fill="currentColor" />
                <span className="text-4xl md:text-5xl font-black text-primary tabular-nums">
                  {isLoading ? '...' : hits}
                </span>
                <span className="text-xl font-bold text-primary/60 self-end mb-1">HITS</span>
              </motion.div>
            </div>

            {/* The Toy */}
            <div className="relative">
              {/* Question Bubble */}
              <div className="absolute -top-12 left-0 right-0 h-16 pointer-events-none flex items-center justify-center z-20">
                <AnimatePresence>
                  {currentQuestion && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-xl font-medium text-center relative"
                    >
                      {currentQuestion}
                      <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ToyCharacter onHit={handleHit} hitLevel={hitLevel} />
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-6 mt-12 relative z-10">
              {/* Reset Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="rounded-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border-dashed"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Counter
              </Button>

              {/* Milestones Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground/60 font-medium bg-muted/30 px-6 py-2 rounded-full">
                 <Trophy className="h-4 w-4" />
                 Milestones: 10, 50, 100+
              </div>
            </div>
          </motion.div>

          {/* Interactive Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground/80 italic max-w-md mx-auto leading-relaxed">
              Don't hold it in. Let the toy handle it! <br/>
              Every tap makes him tougher and you lighter.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
