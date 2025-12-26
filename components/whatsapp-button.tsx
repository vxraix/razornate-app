'use client'

import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface WhatsAppButtonProps {
  phoneNumber?: string
  message?: string
}

export function WhatsAppButton({ 
  phoneNumber = '+5978814672', 
  message = 'Hello! I would like to book an appointment.' 
}: WhatsAppButtonProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`
    window.open(url, '_blank')
  }

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-3 sm:p-4 shadow-2xl flex items-center gap-2 sm:gap-3 group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      <span className="hidden sm:block font-semibold text-sm sm:text-base">Chat on WhatsApp</span>
    </motion.button>
  )
}






