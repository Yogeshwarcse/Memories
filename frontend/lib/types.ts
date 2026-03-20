export interface Song {
  _id?: string
  id: string
  title: string
  artist: string
  coverImage: string
  audioUrl: string
  spotifyUrl?: string
  tags: string[]
  createdAt: string
}

export interface FavoriteDay {
  _id?: string
  id: string
  date: string
  image: string
  description: string
  tags: string[]
  createdAt: string
}

export interface Snap {
  _id?: string
  id: string
  image: string
  description: string
  tags: string[]
  createdAt: string
}

export interface Memory {
  _id?: string
  id: string
  image: string
  description: string
  date: string
  tags: string[]
  createdAt: string
}

export interface FavoriteThing {
  _id?: string
  id: string
  image: string
  description: string
  tags: string[]
  createdAt: string
}

export type MoodTag = 'happy' | 'romantic' | 'sad' | 'nostalgic' | 'peaceful' | 'energetic' | 'fun' | 'love'

export const MOOD_TAGS: MoodTag[] = ['happy', 'romantic', 'sad', 'nostalgic', 'peaceful', 'energetic', 'fun', 'love']

export const CATEGORY_TAGS = ['trip', 'friends', 'family', 'food', 'nature', 'celebration', 'adventure', 'cozy', 'special']
