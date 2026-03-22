'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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
    type: 'text' | 'textarea' | 'date' | 'select' | 'file'
    placeholder?: string
    required?: boolean
    options?: { label: string; value: string }[]
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
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!initialData

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && initialData) {
      const data: Record<string, any> = {}
      fields.forEach(field => {
        if (initialData[field.name] !== undefined && initialData[field.name] !== null) {
          data[field.name] = initialData[field.name]
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

  const availableTags = tagType === 'mood' 
    ? MOOD_TAGS 
    : tagType === 'category' 
      ? CATEGORY_TAGS 
      : [...MOOD_TAGS, ...CATEGORY_TAGS]

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-8 bg-foreground/30 backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden my-auto sm:my-12 max-h-[90vh] flex flex-col border border-border/50"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-2xl hover:bg-muted transition-all active:scale-95"
              >
                <X className="h-6 w-6 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              {fields.map((field) => (
                <div key={field.name} className="space-y-3">
                  <Label htmlFor={field.name} className="text-sm font-semibold ml-1">{field.label}</Label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full min-h-[120px] px-5 py-4 rounded-2xl border border-input bg-muted/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none shadow-inner"
                    />
                  ) : (field.type as string) === 'select' ? (
                    <select
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      required={field.required}
                      className="w-full px-5 py-4 rounded-2xl border border-input bg-muted/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer transition-all shadow-inner"
                    >
                      <option value="" disabled>{field.placeholder || `Select ${field.label}`}</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'file' ? (
                    <div className="space-y-4">
                      {formData[field.name] && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-dashed border-primary/20 bg-muted/30 group"
                        >
                          {typeof formData[field.name] === 'string' ? (
                            <img 
                              src={formData[field.name]} 
                              alt="Preview" 
                              className="w-full h-full object-contain"
                            />
                          ) : formData[field.name] instanceof File ? (
                            <img 
                              src={URL.createObjectURL(formData[field.name])} 
                              alt="Preview" 
                              className="w-full h-full object-contain"
                            />
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, [field.name]: undefined }))}
                            className="absolute top-3 right-3 p-2 rounded-xl bg-destructive text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </motion.div>
                      )}
                      
                      <div className="flex flex-col gap-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                          {formData[field.name] ? 'Replace Image' : 'Select Image'}
                        </Label>
                        <Input
                          id={`${field.name}-file`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setFormData(prev => ({ ...prev, [field.name]: file }))
                            }
                          }}
                          className="cursor-pointer h-auto py-3 px-4 rounded-2xl bg-muted/20 border-border/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type === 'select' ? 'text' : field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="h-14 px-5 rounded-2xl bg-muted/20 border-border/50 focus:ring-primary/30 transition-all shadow-inner"
                    />
                  )}
                </div>
              ))}

              {showTags && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold ml-1">Connect with Tags</Label>
                  <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-muted/10">
                    {availableTags.map((tag) => (
                      <TagBadge
                        key={tag}
                        tag={tag}
                        selected={selectedTags.includes(tag)}
                        onClick={() => toggleTag(tag)}
                        className="px-4 py-2 text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6 pb-2 sticky bottom-0 bg-transparent">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-14 rounded-2xl text-base font-semibold border-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                >
                  {isEditing ? (
                    <Save className="h-5 w-5 mr-2" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  {isSubmitting 
                    ? (isEditing ? 'Saving...' : 'Adding...') 
                    : (isEditing ? 'Save Changes' : 'Add Post')}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
