'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Snap } from '@/lib/types'
import { API_BASE_URL } from '@/lib/api-config'
import { TagBadge } from '@/components/tag-badge'

interface LightboxProps {
  snap: Snap | null
  snaps: Snap[]
  onClose: () => void
  onNavigate: (snap: Snap) => void
}

export function Lightbox({ snap, snaps, onClose, onNavigate }: LightboxProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (snap) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [snap])

  if (!mounted || !snap) return null

  const imageUrl = snap.image?.startsWith('http')
    ? snap.image
    : snap.image?.startsWith('data:')
      ? snap.image
      : snap.image?.startsWith('/uploads/') 
        ? `${API_BASE_URL}${snap.image}` 
        : '/placeholder.jpg'

  const currentIndex = snaps.findIndex(s => (s._id || s.id) === (snap._id || snap.id))
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < snaps.length - 1

  const handlePrev = () => {
    if (hasPrev) {
      onNavigate(snaps[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (hasNext) {
      onNavigate(snaps[currentIndex + 1])
    }
  }

  return createPortal(
    <AnimatePresence>
      {snap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-foreground/95 backdrop-blur-xl overflow-y-auto pt-8 pb-12 sm:pt-16 px-4"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="fixed top-6 right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all z-[110] active:scale-95 backdrop-blur-md border border-white/10"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Navigation - Previous */}
          {hasPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev() }}
              className="fixed left-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all z-[110] active:scale-95 backdrop-blur-md border border-white/10 hidden sm:block"
            >
              <ChevronLeft className="h-8 w-8 text-white" />
            </button>
          )}

          {/* Navigation - Next */}
          {hasNext && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNext() }}
              className="fixed right-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all z-[110] active:scale-95 backdrop-blur-md border border-white/10 hidden sm:block"
            >
              <ChevronRight className="h-8 w-8 text-white" />
            </button>
          )}

          {/* Content container */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl flex flex-col items-center gap-6"
          >
            {/* Image container */}
            <div className="relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black/20 border border-white/10">
              <Image
                src={imageUrl}
                alt={snap.description || 'Snap image'}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Info bar */}
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl">
              <div className="flex-1 text-center md:text-left">
                <p className="text-lg font-medium text-white line-clamp-2">{snap.description}</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                {snap.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} className="bg-white/10 text-white border-none" />
                ))}
              </div>
            </div>

            {/* Counter and Mobile Nav */}
            <div className="flex items-center gap-6 mt-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev() }}
                disabled={!hasPrev}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 sm:hidden"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              
              <div className="px-5 py-2 rounded-full bg-white/10 text-white font-medium text-sm border border-white/10">
                {currentIndex + 1} / {snaps.length}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleNext() }}
                disabled={!hasNext}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 sm:hidden"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
