'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, MoreVertical, Pencil, Trash2, Heart } from 'lucide-react'
import { format } from 'date-fns'
import type { Memory } from '@/lib/types'
import { TagBadge } from '@/components/tag-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MemoryCardProps {
  memory: Memory
  index: number
  onEdit: () => void
  onDelete: () => void
  priority?: boolean
}

export function MemoryCard({ memory, index, onEdit, onDelete, priority }: MemoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group glass rounded-2xl overflow-hidden"
    >
      {/* Image Section */}
      <div className="relative h-48 md:h-56">
        <Image
          src={memory.image || '/placeholder-memory.jpg'}
          alt={memory.description}
          fill
          priority={priority}
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Decorative heart */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
          className="absolute top-4 left-4"
        >
          <div className="p-2 rounded-full bg-primary/20 backdrop-blur-sm">
            <Heart className="h-4 w-4 text-primary" fill="currentColor" />
          </div>
        </motion.div>

        {/* Actions */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-xl bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                <MoreVertical className="h-5 w-5 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(memory.date), 'MMMM d, yyyy')}</span>
        </div>

        {/* Description */}
        <p className="text-foreground leading-relaxed mb-4 line-clamp-3">
          {memory.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {memory.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
