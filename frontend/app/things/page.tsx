'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { motion } from 'framer-motion'
import { Gift, Plus, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { PageHeader } from '@/components/page-header'
import { ThingCard } from '@/components/things/thing-card'
import { AddItemModal } from '@/components/add-item-modal'
import { EmptyState } from '@/components/empty-state'
import { TagBadge } from '@/components/tag-badge'
import { Button } from '@/components/ui/button'
import { groupByTags } from '@/lib/algorithms'
import type { FavoriteThing } from '@/lib/types'
import { toast } from 'sonner'

import { API_BASE_URL, fetcher } from '@/lib/api-config'

export default function ThingsPage() {
  const { data: things = [], isLoading } = useSWR<FavoriteThing[]>('/api/favorite-things', fetcher)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingThing, setEditingThing] = useState<FavoriteThing | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const handleAddThing = async (data: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/api/favorite-things`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: data.image,
        description: data.description,
        tags: data.tags
      })
    })

    if (response.ok) {
      mutate('/api/favorite-things')
      toast.success('Added to your favorites!')
    }
  }

  const handleUpdateThing = async (data: Record<string, unknown>) => {
    if (!editingThing) return
    try {
      const id = (editingThing._id || editingThing.id).split(':')[0]
      const response = await fetch(`${API_BASE_URL}/api/favorite-things/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: data.image,
          description: data.description,
          tags: data.tags
        })
      })
      
      if (response.ok) {
        mutate('/api/favorite-things')
        toast.success('Favorite updated!')
      } else {
        const error = await response.json()
        toast.error(`Failed to update item: ${error.message || response.statusText}`)
      }
    } catch (err) {
      toast.error('Network error. Could not update item.')
    }
  }

  const handleDeleteThing = async (id: string) => {
    const sanitizedId = id.split(':')[0]
    const response = await fetch(`${API_BASE_URL}/api/favorite-things?id=${sanitizedId}`, { method: 'DELETE' })
    if (response.ok) {
      mutate('/api/favorite-things')
      toast.success('Removed from favorites')
    }
  }


  // Group things by tags
  const groupedThings = groupByTags(things)
  const allTags = Object.keys(groupedThings).sort()
  
  // Filter things by active tag
  const filteredThings = activeTag 
    ? things.filter(t => t.tags.includes(activeTag))
    : things

  return (
    <div className="min-h-screen gradient-soft">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <PageHeader 
          title="Favorite Things"
          subtitle="Little things that mean so much"
          icon={Gift}
        />

        {/* Add Button */}
        <div className="flex justify-center mb-6">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Favorite
          </Button>
        </div>

        {/* Tag Categories */}
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
              All Things
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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : things.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="No favorites yet"
            description="Start adding the little things that make your life special"
            actionLabel="Add First Favorite"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <>
            {/* Grouped View when tag is selected */}
            {activeTag && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-lg font-medium text-foreground">
                  {filteredThings.length} favorite{filteredThings.length !== 1 ? 's' : ''} in &ldquo;{activeTag}&rdquo;
                </span>
              </motion.div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredThings.map((thing, index) => (
                <ThingCard
                  key={thing._id || thing.id}
                  thing={thing}
                  index={index}
                  priority={index < 4}
                  onEdit={() => {
                    setEditingThing(thing)
                    setIsModalOpen(true)
                  }}
                  onDelete={() => handleDeleteThing(thing._id || thing.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Category Overview - when no filter */}
        {!activeTag && things.length > 0 && allTags.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="text-xl font-semibold text-foreground text-center mb-6">
              Organized by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {allTags.slice(0, 4).map((tag) => (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTag(tag)}
                  className="p-4 rounded-2xl bg-muted hover:bg-muted/80 transition-colors text-center"
                >
                  <p className="text-2xl font-bold text-primary mb-1">
                    {groupedThings[tag].length}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">{tag}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Add/Edit Thing Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingThing(null)
        }}
        onSubmit={editingThing ? handleUpdateThing : handleAddThing}
        title={editingThing ? 'Edit Favorite Thing' : 'Add Favorite Thing'}
        initialData={editingThing ? (editingThing as unknown as Record<string, unknown>) : undefined}
        fields={[
          { name: 'image', label: 'Image URL', type: 'url', placeholder: 'https://...', required: true },
          { name: 'description', label: 'What is it and why do you love it?', type: 'textarea', placeholder: 'Describe this favorite thing...', required: true }
        ]}
        tagType="category"
      />
    </div>
  )
}
