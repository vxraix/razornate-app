'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Send, MessageSquare } from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { formatDateTime } from '@/lib/utils'

interface Message {
  id: string
  content: string
  senderRole: string
  createdAt: string
  user: {
    name: string | null
    image: string | null
    role: string
  }
}

interface MessagingProps {
  appointmentId?: string
  userId?: string
  onClose?: () => void
}

export function Messaging({ appointmentId, userId, onClose }: MessagingProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (appointmentId) params.append('appointmentId', appointmentId)
      if (userId) params.append('userId', userId)

      const response = await fetch(`/api/messages?${params.toString()}`)
      const data = await response.json()
      if (response.ok) {
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [appointmentId, userId])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [appointmentId, userId, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || session?.user?.id,
          appointmentId: appointmentId || null,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const message = await response.json()
      setMessages([...messages, message])
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-400">Loading messages...</div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage =
              message.senderRole === (session?.user?.role || 'CLIENT')
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-gold-500 text-black'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-black/70' : 'text-gray-400'
                    }`}
                  >
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 p-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type your message..."
            className="flex-1 bg-gray-900 border-gray-700 focus:border-gold-500 min-h-[60px]"
            maxLength={1000}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="glow-gold-hover"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}




