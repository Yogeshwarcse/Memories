'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { motion } from 'framer-motion'
import { Calendar, Plus } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { PageHeader } from '@/components/page-header'
import { TimelineCard } from '@/components/days/timeline-card'
import { AddItemModal } from '@/components/add-item-modal'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { groupByDate, formatDateGroup } from '@/lib/algorithms'
import type { FavoriteDay } from '@/lib/types'
import { toast } from 'sonner'

import { API_BASE_URL, fetcher } from '@/lib/api-config'

export default function DaysPage() {
  const { data, error, isLoading } = useSWR<FavoriteDay[]>('/api/favorite-days', fetcher)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<FavoriteDay | null>(null)

  const days = Array.isArray(data) ? data : []

  const handleAddDay = async (data: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/api/favorite-days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: data.date,
        image: data.image,
        description: data.description,
        tags: data.tags
      })
    })
    
    if (response.ok) {
      mutate('/api/favorite-days')
      toast.success('Day added to your favorites!')
    }
  }

  const handleUpdateDay = async (data: Record<string, unknown>) => {
    if (!editingDay) return
    try {
      const id = (editingDay._id || editingDay.id).split(':')[0]
      const response = await fetch(`${API_BASE_URL}/api/favorite-days/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: data.date,
          image: data.image,
          description: data.description,
          tags: data.tags
        })
      })
      
      if (response.ok) {
        mutate('/api/favorite-days')
        toast.success('Day updated!')
      } else {
        const error = await response.json()
        toast.error(`Failed to update day: ${error.message || response.statusText}`)
      }
    } catch (err) {
      toast.error('Network error. Could not update day.')
    }
  }

  const handleDeleteDay = async (id: string) => {
    const sanitizedId = id.split(':')[0]
    const response = await fetch(`${API_BASE_URL}/api/favorite-days?id=${sanitizedId}`, { method: 'DELETE' })
    if (response.ok) {
      mutate('/api/favorite-days')
      toast.success('Day removed')
    }
  }


  // Group days by month/year
  const groupedDays = groupByDate(days)
  const sortedGroups = Object.entries(groupedDays).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div className="min-h-screen gradient-soft">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <PageHeader 
          title="Favorite Days"
          subtitle="Days we never want to forget"
          icon={Calendar}
        />

        {/* Add Button */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Day
          </Button>
        </div>

        {isLoading ? (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : days.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No favorite days yet"
            description="Start adding those special days you want to remember forever"
            actionLabel="Add First Day"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="max-w-5xl mx-auto pt-4">
            {sortedGroups.map(([dateKey, groupDays]) => (
              <div key={dateKey} className="mb-12">
                  {/* Date Group Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                  >
                    <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
                      {formatDateGroup(dateKey)}
                    </span>
                  </motion.div>

                  {/* Days in this group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {groupDays.map((day, index) => (
                      <TimelineCard
                        key={day._id || day.id}
                        day={day}
                        index={index}
                        priority={index < 4}
                        onEdit={() => {
                          setEditingDay(day)
                          setIsModalOpen(true)
                        }}
                        onDelete={() => handleDeleteDay(day._id || day.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
      </main>

      {/* Add/Edit Day Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingDay(null)
        }}
        onSubmit={editingDay ? handleUpdateDay : handleAddDay}
        title={editingDay ? 'Edit Favorite Day' : 'Add Favorite Day'}
        initialData={editingDay ? (editingDay as unknown as Record<string, unknown>) : undefined}
        fields={[
          { name: 'date', label: 'Date', type: 'date', required: true },
          { name: 'image', label: 'Image URL', type: 'url', placeholder: 'https://...' },
          { name: 'description', label: 'What made this day special?', type: 'textarea', placeholder: 'Tell the story of this day...', required: true }
        ]}
        tagType="both"
      />
    </div>
  )
}
