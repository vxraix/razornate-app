'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Confetti() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => setShow(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 2,
  }))

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confetti.map((item) => (
            <motion.div
              key={item.id}
              className="absolute w-2 h-2 bg-gold-500 rounded-full"
              initial={{
                x: `${item.x}vw`,
                y: -10,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                y: '100vh',
                opacity: 0,
                rotate: 360,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: item.duration,
                delay: item.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}






