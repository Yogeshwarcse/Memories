'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Song } from '@/lib/types'
import { API_BASE_URL } from '@/lib/api-config'

const getFullAudioUrl = (url: string | undefined) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}${url}`
}

interface MusicPlayerState {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playlist: Song[]
  currentIndex: number
}

export function useMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<MusicPlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    playlist: [],
    currentIndex: -1
  })

  // Keep state ref so callbacks always access latest state
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = state.volume

    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }))
    }

    const handleLoadedMetadata = () => {
      setState(prev => ({ ...prev, duration: audio.duration }))
    }

    const handleEnded = () => {
      const { playlist, currentIndex } = stateRef.current
      if (playlist.length === 0) return

      const nextIndex = (currentIndex + 1) % playlist.length
      const nextSong = playlist[nextIndex]

      // If next song is Spotify, it will show the embed but won't "auto-play" 
      // the same way because of browser autoplay restrictions on iframes.
      // But we update state to show the right player.
      if (nextSong.spotifyUrl) {
        audio.pause()
        audio.src = ''
      } else {
        audio.src = getFullAudioUrl(nextSong.audioUrl)
        audio.play().catch((err) => console.error('Audio play failed:', err))
      }

      setState(prev => ({
        ...prev,
        currentSong: nextSong,
        currentIndex: nextIndex,
        isPlaying: !nextSong.spotifyUrl,
        currentTime: 0
      }))
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.pause()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const playSong = useCallback((song: Song, playlist?: Song[], index?: number) => {
    if (audioRef.current) {
      const pl = playlist ?? stateRef.current.playlist
      const idx = index ?? pl.findIndex(s => (s._id || s.id) === (song._id || song.id))

      if (stateRef.current.currentSong?._id === song._id || stateRef.current.currentSong?.id === song.id) {
        if (!song.spotifyUrl) {
          if (stateRef.current.isPlaying) {
            audioRef.current.pause()
            setState(prev => ({ ...prev, isPlaying: false }))
          } else {
            audioRef.current.play()
            setState(prev => ({ ...prev, isPlaying: true }))
          }
        }
      } else {
        if (song.spotifyUrl) {
          audioRef.current.pause()
          audioRef.current.src = ''
          setState(prev => ({
            ...prev,
            currentSong: song,
            currentIndex: idx,
            playlist: pl,
            isPlaying: false, // Spotify handles its own playing state
            currentTime: 0
          }))
        } else {
          audioRef.current.src = getFullAudioUrl(song.audioUrl)
          audioRef.current.play().catch(() => {})
          
          setState(prev => ({
            ...prev,
            currentSong: song,
            currentIndex: idx,
            playlist: pl,
            isPlaying: true,
            currentTime: 0
          }))
        }
      }
    }
  }, [])

  const playPlaylist = useCallback((songs: Song[], startIndex: number) => {
    const song = songs[startIndex]
    if (!song || !audioRef.current) return
    
    if (song.spotifyUrl) {
      audioRef.current.pause()
      audioRef.current.src = ''
      setState(prev => ({
        ...prev,
        currentSong: song,
        currentIndex: startIndex,
        playlist: songs,
        isPlaying: false,
        currentTime: 0
      }))
    } else {
      audioRef.current.src = getFullAudioUrl(song.audioUrl)
      audioRef.current.play().catch(() => {})

      setState(prev => ({
        ...prev,
        currentSong: song,
        currentIndex: startIndex,
        playlist: songs,
        isPlaying: true,
        currentTime: 0
      }))
    }
  }, [])

  const nextSong = useCallback(() => {
    const { playlist, currentIndex } = stateRef.current
    if (playlist.length === 0) return

    const nextIndex = (currentIndex + 1) % playlist.length
    const song = playlist[nextIndex]

    if (audioRef.current) {
      if (song.spotifyUrl) {
        audioRef.current.pause()
        audioRef.current.src = ''
      } else {
        audioRef.current.src = getFullAudioUrl(song.audioUrl)
        audioRef.current.play().catch(() => {})
      }
    }

    setState(prev => ({
      ...prev,
      currentSong: song,
      currentIndex: nextIndex,
      isPlaying: !song.spotifyUrl,
      currentTime: 0
    }))
  }, [])

  const prevSong = useCallback(() => {
    const { playlist, currentIndex } = stateRef.current
    if (playlist.length === 0) return

    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length
    const song = playlist[prevIndex]

    if (audioRef.current) {
      if (song.spotifyUrl) {
        audioRef.current.pause()
        audioRef.current.src = ''
      } else {
        audioRef.current.src = getFullAudioUrl(song.audioUrl)
        audioRef.current.play().catch(() => {})
      }
    }

    setState(prev => ({
      ...prev,
      currentSong: song,
      currentIndex: prevIndex,
      isPlaying: !song.spotifyUrl,
      currentTime: 0
    }))
  }, [])

  const togglePlay = useCallback(() => {
    if (audioRef.current && stateRef.current.currentSong) {
      if (stateRef.current.isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
    }
  }, [])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setState(prev => ({ ...prev, currentTime: time }))
    }
  }, [])

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      setState(prev => ({ ...prev, volume }))
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
        currentSong: null,
        currentIndex: -1
      }))
    }
  }, [])

  return {
    ...state,
    playSong,
    playPlaylist,
    nextSong,
    prevSong,
    togglePlay,
    seek,
    setVolume,
    stop
  }
}
