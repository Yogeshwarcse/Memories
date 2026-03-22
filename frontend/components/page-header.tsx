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
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
          },
        },
      }}
      className="text-center mb-8"
    >
      {Icon && (
        <motion.div
          variants={{
            hidden: { scale: 0.5, rotate: -45, opacity: 0 },
            visible: { scale: 1, rotate: 0, opacity: 1 },
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 mb-4"
        >
          <Icon className="h-8 w-8 text-primary" />
        </motion.div>
      )}
      <motion.h1 
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p 
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
          className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}
