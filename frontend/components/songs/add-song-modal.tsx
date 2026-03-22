'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Music2, Loader2, CheckCircle2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagBadge } from '@/components/tag-badge'
import { MOOD_TAGS } from '@/lib/types'
import type { Song } from '@/lib/types'
import { API_BASE_URL } from '@/lib/api-config'

interface AddSongModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  editingSong?: Song | null
}

function isSpotifyUrl(url: string): boolean {
  return (
    url.includes('open.spotify.com/') ||
    url.startsWith('spotify:track:') ||
    url.startsWith('spotify:episode:')
  )
}

function extractSpotifyPreviewId(url: string): { type: string; id: string } | null {
  try {
    const uriMatch = url.match(/spotify:(track|episode|album|playlist):([A-Za-z0-9]+)/)
    if (uriMatch) return { type: uriMatch[1], id: uriMatch[2] }
    const urlMatch = url.match(/open\.spotify\.com\/(track|episode|album|playlist)\/([A-Za-z0-9]+)/)
    if (urlMatch) return { type: urlMatch[1], id: urlMatch[2] }
    return null
  } catch {
    return null
  }
}

export function AddSongModal({ isOpen, onClose, onSubmit, editingSong }: AddSongModalProps) {
  const [spotifyUrl, setSpotifyUrl] = useState(editingSong?.spotifyUrl || '')
  const [title, setTitle] = useState(editingSong?.title || '')
  const [artist, setArtist] = useState(editingSong?.artist || '')
  const [coverImage, setCoverImage] = useState(editingSong?.coverImage || '')
  const [audioUrl, setAudioUrl] = useState(editingSong?.audioUrl || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(editingSong?.tags || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSpotifyUrl(editingSong?.spotifyUrl || '')
      setTitle(editingSong?.title || '')
      setArtist(editingSong?.artist || '')
      setCoverImage(editingSong?.coverImage || '')
      setAudioUrl(editingSong?.audioUrl || '')
      setSelectedTags(editingSong?.tags || [])
      setAutoFilled(false)
    }
  }, [isOpen, editingSong])

  // Auto-fetch Spotify metadata when URL changes
  useEffect(() => {
    if (!spotifyUrl || !isSpotifyUrl(spotifyUrl)) {
      setAutoFilled(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setIsFetching(true)
      try {
        const res = await fetch(`${API_BASE_URL}/api/spotify-oembed?url=${encodeURIComponent(spotifyUrl)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.title) setTitle(data.title)
          if (data.artist) setArtist(data.artist)
          if (data.coverImage) setCoverImage(data.coverImage)
          setAutoFilled(true)
        }
      } catch {
        // silently fail — user can fill manually
      } finally {
        setIsFetching(false)
      }
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [spotifyUrl])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await onSubmit({
      title,
      artist,
      coverImage,
      audioUrl,
      spotifyUrl,
      tags: selectedTags
    })
    setIsSubmitting(false)
    onClose()
  }

  if (!mounted) return null

  const parsed = spotifyUrl ? extractSpotifyPreviewId(spotifyUrl) : null
  const embedUrl = parsed
    ? `https://open.spotify.com/embed/${parsed.type}/${parsed.id}?utm_source=generator&theme=0`
    : null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-8 bg-foreground/30 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden my-auto sm:my-12 max-h-[90vh] flex flex-col border border-border/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-10 font-sans">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-primary/10">
                  <Music2 className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {editingSong ? 'Edit Song' : 'Add New Song'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-2xl hover:bg-muted transition-all active:scale-95">
                <X className="h-6 w-6 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {/* Spotify URL — magic paste field */}
              <div className="space-y-3">
                <Label htmlFor="spotifyUrl" className="text-sm font-semibold ml-1 flex items-center gap-2">
                  <span className="text-[#1DB954] font-bold">Spotify</span> Track URL
                  <span className="text-xs text-muted-foreground font-normal">(pasting will auto-fill info)</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="spotifyUrl"
                    type="url"
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    placeholder="https://open.spotify.com/track/..."
                    className="h-14 px-5 rounded-2xl bg-muted/20 border-border/50 focus:ring-primary/30 transition-all pr-12 shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isFetching && <Loader2 className="h-5 w-5 text-[#1DB954] animate-spin" />}
                    {autoFilled && !isFetching && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="h-5 w-5 text-[#1DB954]" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Spotify Preview */}
              {embedUrl && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }}
                  className="rounded-2xl overflow-hidden border border-border/50 shadow-sm"
                >
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="80"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ border: 'none' }}
                    title="Spotify Preview"
                  />
                </motion.div>
              )}

              {/* Divider */}
              {!spotifyUrl && (
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-muted-foreground">
                    <span className="bg-card px-4">Manual Entry</span>
                  </div>
                </div>
              )}

              {/* Song Info Fields */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-semibold ml-1">Song Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Perfect"
                    required
                    className="h-14 px-5 rounded-2xl bg-muted/20 border-border/50 focus:ring-primary/30 transition-all shadow-inner font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="artist" className="text-sm font-semibold ml-1">Artist Name *</Label>
                  <Input
                    id="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Ed Sheeran"
                    required
                    className="h-14 px-5 rounded-2xl bg-muted/20 border-border/50 focus:ring-primary/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="audioUrl" className="text-sm font-semibold ml-1">Audio Source URL (optional)</Label>
                <Input
                  id="audioUrl"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="/songs/filename.mp3"
                  className="h-14 px-5 rounded-2xl bg-muted/20 border-border/50 focus:ring-primary/30 transition-all shadow-inner"
                />
                <p className="text-[11px] text-muted-foreground px-2 italic">
                  Tip: For uploaded songs, use <strong>/songs/filename.mp3</strong>
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold ml-1">Mood & Vibe</Label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_TAGS.map((tag) => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      selected={selectedTags.includes(tag)}
                      onClick={() => toggleTag(tag)}
                      className="px-4 py-2 text-sm cursor-pointer"
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 sticky bottom-0 bg-card/50 backdrop-blur-md pb-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  className="flex-1 h-14 rounded-2xl text-base font-semibold border-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !title || !artist || (!audioUrl && !spotifyUrl)}
                  className="flex-1 h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : editingSong ? (
                    <Save className="h-5 w-5 mr-2" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  {isSubmitting ? 'Saving...' : editingSong ? 'Save Changes' : 'Add Song'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
