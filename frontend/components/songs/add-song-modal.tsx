'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Music2, Loader2, CheckCircle2 } from 'lucide-react'
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  if (!isOpen) return null

  const parsed = spotifyUrl ? extractSpotifyPreviewId(spotifyUrl) : null
  const embedUrl = parsed
    ? `https://open.spotify.com/embed/${parsed.type}/${parsed.id}?utm_source=generator&theme=0`
    : null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
            <div className="flex items-center gap-2">
              <Music2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                {editingSong ? 'Edit Song' : 'Add Song'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Spotify URL — magic paste field */}
            <div className="space-y-2">
              <Label htmlFor="spotifyUrl" className="flex items-center gap-2">
                <span className="text-[#1DB954] font-bold">Spotify</span> Track URL
                <span className="text-xs text-muted-foreground">(paste to auto-fill)</span>
              </Label>
              <div className="relative">
                <Input
                  id="spotifyUrl"
                  type="url"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  className="rounded-xl pr-10 border-[#1DB954]/40 focus-visible:ring-[#1DB954]/50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isFetching && <Loader2 className="h-4 w-4 text-[#1DB954] animate-spin" />}
                  {autoFilled && !isFetching && <CheckCircle2 className="h-4 w-4 text-[#1DB954]" />}
                </div>
              </div>
              {autoFilled && (
                <p className="text-xs text-[#1DB954] flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Auto-filled from Spotify
                </p>
              )}
            </div>

            {/* Spotify Preview */}
            {embedUrl && (
              <div className="rounded-xl overflow-hidden border border-border">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="80"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ border: 'none' }}
                  title="Spotify Preview"
                />
              </div>
            )}

            {/* Divider */}
            {!spotifyUrl && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">or fill in manually</span>
                </div>
              </div>
            )}

            {/* Song Info Fields */}
            <div className="space-y-2">
              <Label htmlFor="title">Song Title *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter song title"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
              <Input
                id="artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Enter artist name"
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audioUrl">Audio Source URL</Label>
              <Input
                id="audioUrl"
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="/songs/filename.mp3"
                className="rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground px-1">
                Tip: For songs in your backend folder, use <strong>/songs/filename.mp3</strong>.
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Mood Tags</Label>
              <div className="flex flex-wrap gap-2">
                {MOOD_TAGS.map((tag) => (
                  <TagBadge
                    key={tag}
                    tag={tag}
                    selected={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title || !artist || (!audioUrl && !spotifyUrl)}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Saving...' : editingSong ? 'Save Changes' : 'Add Song'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
