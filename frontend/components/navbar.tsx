'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Music, 
  Calendar, 
  Camera, 
  BookOpen, 
  Gift,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Heart },
  { href: '/songs', label: 'Songs', icon: Music },
  { href: '/days', label: 'Days', icon: Calendar },
  { href: '/snaps', label: 'Snaps', icon: Camera },
  { href: '/memories', label: 'Memories', icon: BookOpen },
  { href: '/things', label: 'Things', icon: Gift },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className="glass mx-4 mt-4 rounded-2xl px-4 py-3 md:mx-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20"
            >
              <Heart className="h-5 w-5 text-primary" fill="currentColor" />
            </motion.div>
            <span className="text-lg font-semibold text-foreground">
              Memories of Us
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl transition-colors',
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-primary/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pt-4 border-t border-border"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-primary/10 text-muted-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  )
}
