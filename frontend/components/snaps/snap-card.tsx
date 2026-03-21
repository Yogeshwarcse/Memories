'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Expand, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { Snap } from '@/lib/types'
import { TagBadge } from '@/components/tag-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SnapCardProps {
  snap: Snap
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  priority?: boolean
}

export function SnapCard({ snap, onView, onEdit, onDelete, priority = false }: SnapCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
      onClick={onView}
    >
      <Image
        src={snap.image || '/placeholder-snap.jpg'}
        alt={snap.description}
        fill
        priority={priority}
        className="object-cover transition-transform group-hover:scale-110"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Top row - actions */}
        <div className="flex justify-between items-start">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
            className="p-2 rounded-xl bg-card/80 backdrop-blur-sm"
          >
            <Expand className="h-4 w-4 text-foreground" />
          </motion.button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button className="p-2 rounded-xl bg-card/80 backdrop-blur-sm">
                <MoreVertical className="h-4 w-4 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete() }} className="gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bottom row - info */}
        <div className="space-y-2">
          <p className="text-white font-medium line-clamp-2 leading-tight drop-shadow-md">
            {snap.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {snap.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} tag={tag} className="bg-white/20 text-white border-none backdrop-blur-md" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
