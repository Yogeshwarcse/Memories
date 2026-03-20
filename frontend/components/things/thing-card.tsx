'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { FavoriteThing } from '@/lib/types'
import { TagBadge } from '@/components/tag-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ThingCardProps {
  thing: FavoriteThing
  index: number
  onEdit: () => void
  onDelete: () => void
  priority?: boolean
}

export function ThingCard({ thing, index, onEdit, onDelete, priority }: ThingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative glass rounded-2xl overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={thing.image || '/placeholder-thing.jpg'}
          alt={thing.description}
          fill
          priority={priority}
          className="object-cover transition-transform group-hover:scale-110"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
        
        {/* Heart decoration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 + index * 0.05, type: 'spring' }}
          className="absolute top-3 left-3"
        >
          <div className="p-2 rounded-full bg-primary/30 backdrop-blur-sm">
            <Heart className="h-4 w-4 text-white" fill="currentColor" />
          </div>
        </motion.div>

        {/* Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-xl bg-card/80 backdrop-blur-sm hover:bg-card transition-colors">
                <MoreVertical className="h-4 w-4 text-foreground" />
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

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-medium mb-2 line-clamp-2">{thing.description}</p>
          <div className="flex flex-wrap gap-1">
            {thing.tags.slice(0, 2).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
