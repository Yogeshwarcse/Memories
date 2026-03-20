'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Music, 
  Calendar, 
  Camera, 
  BookOpen, 
  Gift,
  Sparkles
} from 'lucide-react'
import { Navbar } from '@/components/navbar'

const modules = [
  {
    href: '/songs',
    title: 'Our Favorite Songs',
    description: 'The soundtrack of our love story',
    icon: Music,
    gradient: 'from-pink-400 to-rose-400',
    delay: 0.1
  },
  {
    href: '/days',
    title: 'Favorite Days',
    description: 'Days we never want to forget',
    icon: Calendar,
    gradient: 'from-purple-400 to-pink-400',
    delay: 0.2
  },
  {
    href: '/snaps',
    title: 'Favorite Snaps',
    description: 'Captured moments of joy',
    icon: Camera,
    gradient: 'from-orange-400 to-pink-400',
    delay: 0.3
  },
  {
    href: '/memories',
    title: 'Our Memories',
    description: 'Stories written in our hearts',
    icon: BookOpen,
    gradient: 'from-cyan-400 to-purple-400',
    delay: 0.4
  },
  {
    href: '/things',
    title: 'Favorite Things',
    description: 'Little things that mean so much',
    icon: Gift,
    gradient: 'from-emerald-400 to-cyan-400',
    delay: 0.5
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 gradient-soft" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-pink-200/40 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl"
        />
      </div>

      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/20 mb-6"
          >
            <Heart className="h-10 w-10 text-primary animate-pulse-soft" fill="currentColor" />
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance">
            Memories of Us
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            A place where our moments live forever
          </p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Store, organize, and relive your special memories</span>
            <Sparkles className="h-4 w-4 text-primary" />
          </motion.div>
        </motion.div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map((module) => (
            <Link key={module.href} href={module.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: module.delay, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative glass rounded-3xl p-6 cursor-pointer overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} 
                />
                
                <div className="relative z-10">
                  <div 
                    className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    <module.icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {module.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {module.description}
                  </p>
                </div>

                {/* Decorative corner */}
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Footer Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground italic">
            &ldquo;The best thing to hold onto in life is each other.&rdquo;
          </p>
          <p className="text-sm text-muted-foreground mt-2">- Audrey Hepburn</p>
        </motion.div>
      </main>
    </div>
  )
}
