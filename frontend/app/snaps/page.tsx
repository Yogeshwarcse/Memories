'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { motion } from 'framer-motion'
import { Camera, Plus } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { PageHeader } from '@/components/page-header'
import { SnapCard } from '@/components/snaps/snap-card'
import { Lightbox } from '@/components/snaps/lightbox'
import { AddItemModal } from '@/components/add-item-modal'
import { EmptyState } from '@/components/empty-state'
import { TagBadge } from '@/components/tag-badge'
import { Button } from '@/components/ui/button'
import { groupByTags } from '@/lib/algorithms'
import type { Snap } from '@/lib/types'
import { toast } from 'sonner'

import { API_BASE_URL, fetcher } from '@/lib/api-config'

export default function SnapsPage() {
  const { data, isLoading } = useSWR<Snap[]>('/api/snaps', fetcher)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSnap, setEditingSnap] = useState<Snap | null>(null)
  const [selectedSnap, setSelectedSnap] = useState<Snap | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const snaps = Array.isArray(data) ? data : []

  const handleAddSnap = async (data: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/api/snaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: data.image,
        tags: data.tags
      })
    })
    
    if (response.ok) {
      mutate('/api/snaps')
      toast.success('Snap added!')
    }
  }

  const handleUpdateSnap = async (data: Record<string, unknown>) => {
    if (!editingSnap) return
    try {
      const id = (editingSnap._id || editingSnap.id).split(':')[0]
      const response = await fetch(`${API_BASE_URL}/api/snaps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: data.image,
          tags: data.tags
        })
      })
      
      if (response.ok) {
        mutate('/api/snaps')
        toast.success('Snap updated!')
      } else {
        const error = await response.json()
        toast.error(`Failed to update snap: ${error.message || response.statusText}`)
      }
    } catch (err) {
      toast.error('Network error. Could not update snap.')
    }
  }

  const handleDeleteSnap = async (id: string) => {
    const sanitizedId = id.split(':')[0]
    const response = await fetch(`${API_BASE_URL}/api/snaps?id=${sanitizedId}`, { method: 'DELETE' })
    if (response.ok) {
      mutate('/api/snaps')
      toast.success('Snap deleted')
    }
  }


  // Group snaps by tags
  const groupedSnaps = groupByTags(snaps)
  const allTags = Object.keys(groupedSnaps).sort()
  
  // Filter snaps by active tag
  const filteredSnaps = activeTag 
    ? snaps.filter(s => s.tags.includes(activeTag))
    : snaps

  return (
    <div className="min-h-screen gradient-soft">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <PageHeader 
          title="Favorite Snaps"
          subtitle="Captured moments of joy"
          icon={Camera}
        />

        {/* Add Button */}
        <div className="flex justify-center mb-6">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Snap
          </Button>
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTag === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : snaps.length === 0 ? (
          <EmptyState
            icon={Camera}
            title="No snaps yet"
            description="Start capturing moments by adding your favorite photos"
            actionLabel="Add First Snap"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSnaps.map((snap, index) => (
              <motion.div
                key={snap._id || snap.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <SnapCard
                  snap={snap}
                  priority={index < 4}
                  onView={() => setSelectedSnap(snap)}
                  onEdit={() => {
                    setEditingSnap(snap)
                    setIsModalOpen(true)
                  }}
                  onDelete={() => handleDeleteSnap(snap._id || snap.id)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        {snaps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground">
              {snaps.length} memories captured
              {activeTag && ` in "${activeTag}"`}
            </p>
          </motion.div>
        )}
      </main>

      {/* Lightbox */}
      <Lightbox
        snap={selectedSnap}
        snaps={filteredSnaps}
        onClose={() => setSelectedSnap(null)}
        onNavigate={setSelectedSnap}
      />

      {/* Add/Edit Snap Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingSnap(null)
        }}
        onSubmit={editingSnap ? handleUpdateSnap : handleAddSnap}
        title={editingSnap ? 'Edit Snap' : 'Add New Snap'}
        initialData={editingSnap ? (editingSnap as unknown as Record<string, unknown>) : undefined}
        fields={[
          { name: 'image', label: 'Image URL', type: 'url', placeholder: 'https://...', required: true }
        ]}
        tagType="category"
      />
    </div>
  )
}
