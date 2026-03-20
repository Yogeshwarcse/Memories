'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
}

export function PageHeader({ title, subtitle, icon: Icon }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 mb-4"
        >
          <Icon className="h-8 w-8 text-primary" />
        </motion.div>
      )}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
