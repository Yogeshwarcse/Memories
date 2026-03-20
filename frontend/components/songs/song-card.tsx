'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play, Pause, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { Song } from '@/lib/types'
import { TagBadge } from '@/components/tag-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SongCardProps {
  song: Song
  isPlaying: boolean
  isCurrentSong: boolean
  onPlay: () => void
  onEdit: () => void
  onDelete: () => void
}

export function SongCard({ 
  song, 
  isPlaying, 
  isCurrentSong, 
  onPlay, 
  onEdit, 
  onDelete 
}: SongCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`group relative glass rounded-2xl p-4 flex items-center gap-4 transition-all cursor-pointer ${
        isCurrentSong ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onPlay}
    >
      {/* Album Art */}
      <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0">
        <Image
          src={song.coverImage || '/placeholder-album.jpg'}
          alt={song.title}
          fill
          className="object-cover"
        />
        <motion.div
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isPlaying && isCurrentSong ? (
            <Pause className="h-6 w-6 text-white" fill="currentColor" />
          ) : (
            <Play className="h-6 w-6 text-white" fill="currentColor" />
          )}
        </motion.div>
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{song.title}</h3>
          {song.spotifyUrl && (
            <span
              className="flex-shrink-0 flex items-center gap-0.5 text-[10px] font-bold text-[#1DB954] bg-[#1DB954]/10 rounded-full px-2 py-0.5"
              title="Play via Spotify"
            >
              <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-current">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Spotify
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {song.tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </div>

      {/* Actions dropdown — stop propagation so clicking doesn't trigger onPlay */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="p-2 rounded-xl hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl" onClick={(e) => e.stopPropagation()}>
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

      {/* Playing indicator */}
      {isCurrentSong && isPlaying && (
        <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </motion.div>
  )
}
