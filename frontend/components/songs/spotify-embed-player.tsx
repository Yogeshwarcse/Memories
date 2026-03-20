'use client'

import type { Song } from '@/lib/types'

interface SpotifyEmbedPlayerProps {
  song: Song
}

export function SpotifyEmbedPlayer({ song }: SpotifyEmbedPlayerProps) {
  if (!song.spotifyUrl) return null

  const extractSpotifyPreviewId = (url: string) => {
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

  const parsed = extractSpotifyPreviewId(song.spotifyUrl)
  if (!parsed) return null

  const embedUrl = `https://open.spotify.com/embed/${parsed.type}/${parsed.id}?utm_source=generator&theme=0`

  return (
    <div className="w-full rounded-xl overflow-hidden bg-black/5 animate-in fade-in zoom-in duration-300">
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="border-0"
        title={`Spotify Player: ${song.title}`}
      />
    </div>
  )
}
