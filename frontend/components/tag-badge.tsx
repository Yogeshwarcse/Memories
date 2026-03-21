'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
  tag: string
  selected?: boolean
  onClick?: () => void
  removable?: boolean
  onRemove?: () => void
  className?: string
}

const tagColors: Record<string, string> = {
  happy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  romantic: 'bg-pink-100 text-pink-800 border-pink-200',
  sad: 'bg-blue-100 text-blue-800 border-blue-200',
  nostalgic: 'bg-purple-100 text-purple-800 border-purple-200',
  peaceful: 'bg-green-100 text-green-800 border-green-200',
  energetic: 'bg-orange-100 text-orange-800 border-orange-200',
  fun: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  love: 'bg-rose-100 text-rose-800 border-rose-200',
  trip: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  friends: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  family: 'bg-amber-100 text-amber-800 border-amber-200',
  food: 'bg-lime-100 text-lime-800 border-lime-200',
  nature: 'bg-teal-100 text-teal-800 border-teal-200',
  celebration: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  adventure: 'bg-sky-100 text-sky-800 border-sky-200',
  cozy: 'bg-stone-100 text-stone-800 border-stone-200',
  special: 'bg-violet-100 text-violet-800 border-violet-200',
}

export function TagBadge({ tag, selected, onClick, removable, onRemove, className }: TagBadgeProps) {
  const colorClass = tagColors[tag] || 'bg-secondary text-secondary-foreground border-border'
  
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all',
        colorClass,
        onClick && 'cursor-pointer',
        selected && 'ring-2 ring-primary ring-offset-2',
        className
      )}
    >
      {tag}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:text-destructive"
        >
          x
        </button>
      )}
    </motion.span>
  )
}
