'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { FavoriteDay } from '@/lib/types'
import { TagBadge } from '@/components/tag-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TimelineCardProps {
  day: FavoriteDay
  index: number
  onEdit: () => void
  onDelete: () => void
  priority?: boolean
}

export function TimelineCard({ day, index, onEdit, onDelete, priority = false }: TimelineCardProps) {
  const isLeft = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex flex-col h-full"
    >

      {/* Card */}
      <div className="group flex-1 glass rounded-2xl overflow-hidden flex flex-col h-full">
        <div className="relative aspect-square">
          <Image
            src={day.image || '/placeholder-day.jpg'}
            alt={day.description}
            fill
            priority={priority}
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          
          {/* Date badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {format(new Date(day.date), 'MMMM d, yyyy')}
            </span>
          </div>

          {/* Actions */}
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-xl bg-card/90 backdrop-blur-sm hover:bg-card transition-colors">
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

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-foreground leading-relaxed mb-3">{day.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {day.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
