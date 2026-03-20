'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Clock, History } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { PageHeader } from '@/components/page-header'
import { MemoryCard } from '@/components/memories/memory-card'
import { AddItemModal } from '@/components/add-item-modal'
import { EmptyState } from '@/components/empty-state'
import { TagBadge } from '@/components/tag-badge'
import { Button } from '@/components/ui/button'
import { categorizeByRecency, groupByTags, sortByDate } from '@/lib/algorithms'
import type { Memory } from '@/lib/types'
import { toast } from 'sonner'

import { API_BASE_URL, fetcher } from '@/lib/api-config'

export default function MemoriesPage() {
  const { data, isLoading } = useSWR<Memory[]>('/api/memories', fetcher)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [activeView, setActiveView] = useState<'all' | 'recent' | 'old'>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const memories = Array.isArray(data) ? data : []

  const handleAddMemory = async (data: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/api/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: data.image,
        description: data.description,
        date: data.date,
        tags: data.tags
      })
    })

    if (response.ok) {
      mutate('/api/memories')
      toast.success('Memory added to your journal!')
    }
  }

  const handleUpdateMemory = async (data: Record<string, unknown>) => {
    if (!editingMemory) return
    try {
      const id = (editingMemory._id || editingMemory.id).split(':')[0]
      const response = await fetch(`${API_BASE_URL}/api/memories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: data.image,
          description: data.description,
          date: data.date,
          tags: data.tags
        })
      })
      
      if (response.ok) {
        mutate('/api/memories')
        toast.success('Memory updated!')
      } else {
        const error = await response.json()
        toast.error(`Failed to update memory: ${error.message || response.statusText}`)
      }
    } catch (err) {
      toast.error('Network error. Could not update memory.')
    }
  }

  const handleDeleteMemory = async (id: string) => {
    const sanitizedId = id.split(':')[0]
    const response = await fetch(`${API_BASE_URL}/api/memories?id=${sanitizedId}`, { method: 'DELETE' })
    if (response.ok) {
      mutate('/api/memories')
      toast.success('Memory removed')
    }
  }


  // Organize memories
  const sortedMemories = sortByDate(memories)
  const { recent, old } = categorizeByRecency(sortedMemories)
  const groupedByTags = groupByTags(memories)
  const allTags = Object.keys(groupedByTags).sort()

  // Filter based on active view and tag
  let displayMemories = sortedMemories
  if (activeView === 'recent') displayMemories = recent
  if (activeView === 'old') displayMemories = old
  if (activeTag) displayMemories = displayMemories.filter(m => m.tags.includes(activeTag))

  return (
    <div className="min-h-screen gradient-soft">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <PageHeader 
          title="Our Memories"
          subtitle="Stories written in our hearts"
          icon={BookOpen}
        />

        {/* Add Button */}
        <div className="flex justify-center mb-6">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Memory
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveView('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All Memories
          </button>
          <button
            onClick={() => setActiveView('recent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === 'recent'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Clock className="h-4 w-4" />
            Recent
          </button>
          <button
            onClick={() => setActiveView('old')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === 'old'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <History className="h-4 w-4" />
            Older
          </button>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeTag === null
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <TagBadge
                key={tag}
                tag={tag}
                selected={activeTag === tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              />
            ))}
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : memories.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No memories yet"
            description="Start your journal by adding your first precious memory"
            actionLabel="Add First Memory"
            onAction={() => setIsModalOpen(true)}
          />
        ) : displayMemories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No memories found with the current filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayMemories.map((memory, index) => (
              <MemoryCard
                key={memory._id || memory.id}
                memory={memory}
                index={index}
                priority={index < 2}
                onEdit={() => {
                  setEditingMemory(memory)
                  setIsModalOpen(true)
                }}
                onDelete={() => handleDeleteMemory(memory._id || memory.id)}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {memories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-muted/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{memories.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{recent.length}</p>
                <p className="text-sm text-muted-foreground">Recent</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{old.length}</p>
                <p className="text-sm text-muted-foreground">Cherished</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Add/Edit Memory Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingMemory(null)
        }}
        onSubmit={editingMemory ? handleUpdateMemory : handleAddMemory}
        title={editingMemory ? 'Edit Memory' : 'Add New Memory'}
        initialData={editingMemory ? (editingMemory as unknown as Record<string, unknown>) : undefined}
        fields={[
          { name: 'date', label: 'When did this happen?', type: 'date', required: true },
          { name: 'image', label: 'Image URL', type: 'url', placeholder: 'https://...' },
          { name: 'description', label: 'Tell the story', type: 'textarea', placeholder: 'What happened? How did it make you feel?', required: true }
        ]}
        tagType="both"
      />
    </div>
  )
}
