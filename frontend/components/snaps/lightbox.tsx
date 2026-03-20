'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Snap } from '@/lib/types'
import { TagBadge } from '@/components/tag-badge'

interface LightboxProps {
  snap: Snap | null
  snaps: Snap[]
  onClose: () => void
  onNavigate: (snap: Snap) => void
}

export function Lightbox({ snap, snaps, onClose, onNavigate }: LightboxProps) {
  if (!snap) return null

  const currentIndex = snaps.findIndex(s => s.id === snap.id)
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 rounded-xl bg-card/20 hover:bg-card/40 transition-colors z-10"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Navigation - Previous */}
        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev() }}
            className="absolute left-4 p-3 rounded-xl bg-card/20 hover:bg-card/40 transition-colors z-10"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
        )}

        {/* Navigation - Next */}
        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); handleNext() }}
            className="absolute right-4 p-3 rounded-xl bg-card/20 hover:bg-card/40 transition-colors z-10"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        )}

        {/* Image container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-4xl max-h-[80vh] w-full mx-4"
        >
          <div className="relative aspect-square md:aspect-video rounded-2xl overflow-hidden">
            <Image
              src={snap.image}
              alt={snap.description}
              fill
              className="object-contain"
            />
          </div>

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-foreground/80 to-transparent rounded-b-2xl">
            <div className="flex flex-wrap gap-2">
              {snap.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-card/20 text-white text-sm">
          {currentIndex + 1} / {snaps.length}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
