'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagBadge } from './tag-badge'
import { MOOD_TAGS, CATEGORY_TAGS } from '@/lib/types'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  title: string
  fields: {
    name: string
    label: string
    type: 'text' | 'textarea' | 'date' | 'url'
    placeholder?: string
    required?: boolean
  }[]
  showTags?: boolean
  tagType?: 'mood' | 'category' | 'both'
  initialData?: Record<string, unknown>
  children?: ReactNode
}

export function AddItemModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  showTags = true,
  tagType = 'both',
  initialData
}: AddItemModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!initialData

  useEffect(() => {
    if (isOpen && initialData) {
      const data: Record<string, string> = {}
      fields.forEach(field => {
        if (initialData[field.name] !== undefined && initialData[field.name] !== null) {
          data[field.name] = String(initialData[field.name])
        }
      })
      setFormData(data)
      setSelectedTags((initialData.tags as string[]) || [])
    } else if (isOpen) {
      setFormData({})
      setSelectedTags([])
    }
  }, [isOpen, initialData, fields])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    await onSubmit({
      ...formData,
      tags: selectedTags
    })
    
    if (!isEditing) {
      setFormData({})
      setSelectedTags([])
    }
    setIsSubmitting(false)
    onClose()
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  if (!isOpen) return null

  const availableTags = tagType === 'mood' 
    ? MOOD_TAGS 
    : tagType === 'category' 
      ? CATEGORY_TAGS 
      : [...MOOD_TAGS, ...CATEGORY_TAGS]

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
          className="w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="rounded-xl"
                  />
                )}
              </div>
            ))}

            {showTags && (
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      selected={selectedTags.includes(tag)}
                      onClick={() => toggleTag(tag)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
              >
                {isEditing ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {isSubmitting 
                  ? (isEditing ? 'Saving...' : 'Adding...') 
                  : (isEditing ? 'Save Changes' : 'Add')}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
