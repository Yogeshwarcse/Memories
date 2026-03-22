'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { HeartsBackground } from '@/components/hearts-background'

const pageVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)', scale: 0.98 },
  enter: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)', 
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      when: 'beforeChildren'
    }
  }
}

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <motion.div
      key={pathname}
      variants={pageVariants}
      initial="hidden"
      animate="enter"
      className="min-h-screen"
    >
      <HeartsBackground />
      {children}
    </motion.div>
  )
}
