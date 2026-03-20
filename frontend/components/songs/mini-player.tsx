'use client'

import Image from 'next/image'
import { TagBadge } from './tag-badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, X, Volume2, SkipBack, SkipForward } from 'lucide-react'
import type { Song } from '@/lib/types'
import { Slider } from '@/components/ui/slider'
import { SpotifyEmbedPlayer } from './spotify-embed-player'

interface MiniPlayerProps {
  song: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  hasPrev: boolean
  hasNext: boolean
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function MiniPlayer({
  song,
  isPlaying,
  currentTime,
  duration,
  volume,
  hasPrev,
  hasNext,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onClose,
  onNext,
  onPrev
}: MiniPlayerProps) {
  if (!song) return null

  const isSpotify = !!song.spotifyUrl

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4"
      >
        <div className="max-w-4xl mx-auto glass rounded-2xl shadow-2xl overflow-hidden">
          {/* Spotify embed — shown when song has a Spotify URL */}
          {isSpotify && (
            <div className="px-4 pt-3">
              <SpotifyEmbedPlayer song={song} />
            </div>
          )}

          {/* Player controls row */}
          <div className="flex items-center gap-4 p-4">
            {/* Album Art */}
            <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={song.coverImage || '/placeholder-album.jpg'}
                alt={song.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{song.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
              {isSpotify && (
                <span className="inline-flex items-center gap-1 text-xs text-[#1DB954] font-medium mt-0.5">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                  Spotify
                </span>
              )}
            </div>

            {/* Progress — only for non-Spotify songs */}
            {!isSpotify && (
              <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={([value]) => onSeek(value)}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10">
                  {formatTime(duration)}
                </span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Prev */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onPrev}
                disabled={!hasPrev}
                className="p-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-30"
              >
                <SkipBack className="h-5 w-5 text-foreground" />
              </motion.button>

              {/* Play/Pause — only for non-Spotify songs */}
              {!isSpotify && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onTogglePlay}
                  className="h-12 w-12 rounded-full bg-primary flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-primary-foreground" fill="currentColor" />
                  ) : (
                    <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
                  )}
                </motion.button>
              )}

              {/* Next */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onNext}
                disabled={!hasNext}
                className="p-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-30"
              >
                <SkipForward className="h-5 w-5 text-foreground" />
              </motion.button>

              {/* Volume — only non-Spotify */}
              {!isSpotify && (
                <div className="hidden md:flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={([value]) => onVolumeChange(value / 100)}
                    className="w-20"
                  />
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Mobile Progress — only for non-Spotify */}
          {!isSpotify && (
            <div className="md:hidden px-4 pb-4">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={([value]) => onSeek(value)}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
                <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
