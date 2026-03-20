'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { motion } from 'framer-motion'
import { Music, Plus, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { PageHeader } from '@/components/page-header'
import { SongCard } from '@/components/songs/song-card'
import { MiniPlayer } from '@/components/songs/mini-player'
import { AddSongModal } from '@/components/songs/add-song-modal'
import { EmptyState } from '@/components/empty-state'
import { TagBadge } from '@/components/tag-badge'
import { Button } from '@/components/ui/button'
import { useMusicPlayer } from '@/hooks/use-music-player'
import { getSimilarItems } from '@/lib/algorithms'
import type { Song } from '@/lib/types'
import { toast } from 'sonner'

import { API_BASE_URL, fetcher } from '@/lib/api-config'

export default function SongsPage() {
  const { data, isLoading } = useSWR<Song[]>('/api/songs', fetcher)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  
  const songs = Array.isArray(data) ? data : []
  
  const player = useMusicPlayer()

  const handleAddSong = async (data: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        artist: data.artist,
        coverImage: data.coverImage,
        audioUrl: data.audioUrl,
        spotifyUrl: data.spotifyUrl,
        tags: data.tags
      })
    })
    
    if (response.ok) {
      mutate('/api/songs')
      toast.success('Song added! 🎵')
    }
  }

  const handleEditSong = async (data: Record<string, unknown>) => {
    if (!editingSong) return
    const id = editingSong._id || editingSong.id
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
        title: data.title,
        artist: data.artist,
        coverImage: data.coverImage,
        audioUrl: data.audioUrl,
        spotifyUrl: data.spotifyUrl,
        tags: data.tags
      })
    })
    if (response.ok) {
      mutate('/api/songs')
      setEditingSong(null)
      toast.success('Song updated!')
    }
  }

  const handleDeleteSong = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/songs?id=${id}`, { method: 'DELETE' })
    if (response.ok) {
      mutate('/api/songs')
      toast.success('Song deleted')
    }
  }

  const handlePlaySong = (song: Song, index: number) => {
    player.playPlaylist(songs, index)
  }

  const recommendations = player.currentSong 
    ? getSimilarItems(player.currentSong, songs, 3)
    : []

  return (
    <div className="min-h-screen gradient-soft">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-40">
        <PageHeader 
          title="Our Favorite Songs"
          subtitle="The soundtrack of our love story"
          icon={Music}
        />

        <div className="flex justify-center mb-8">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Song
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <EmptyState
            icon={Music}
            title="No songs yet"
            description="Start building your playlist by adding your favorite songs"
            actionLabel="Add First Song"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid gap-4 max-w-2xl mx-auto">
            {songs.map((song, index) => (
              <motion.div
                key={song._id || song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SongCard
                  song={song}
                  isPlaying={player.isPlaying}
                  isCurrentSong={player.currentSong?._id === song._id || player.currentSong?.id === song.id}
                  onPlay={() => handlePlaySong(song, index)}
                  onEdit={() => setEditingSong(song)}
                  onDelete={() => handleDeleteSong(song._id || song.id)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">You may also like</h2>
            </div>
            <div className="grid gap-3">
              {recommendations.map((song) => (
                <div
                  key={song._id || song.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => {
                    const idx = songs.findIndex(s => (s._id || s.id) === (song._id || song.id))
                    if (idx !== -1) handlePlaySong(song, idx)
                  }}
                >
                  <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={song.coverImage}
                      alt={song.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{song.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>
                  <div className="flex gap-1">
                    {song.tags.slice(0, 2).map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <MiniPlayer
        song={player.currentSong}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        hasPrev={player.playlist.length > 1}
        hasNext={player.playlist.length > 1}
        onTogglePlay={player.togglePlay}
        onSeek={player.seek}
        onVolumeChange={player.setVolume}
        onClose={player.stop}
        onNext={player.nextSong}
        onPrev={player.prevSong}
      />

      <AddSongModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSong}
      />

      {editingSong && (
        <AddSongModal
          isOpen={!!editingSong}
          onClose={() => setEditingSong(null)}
          onSubmit={handleEditSong}
          editingSong={editingSong}
        />
      )}
    </div>
  )
}
