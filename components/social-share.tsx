'use client'

import { Button } from '@/components/ui/button'
import { Share2, Facebook, Twitter, MessageCircle, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface SocialShareProps {
  title?: string
  text?: string
  url?: string
  type?: 'review' | 'appointment' | 'general'
}

export function SocialShare({
  title = 'Razornate',
  text = 'Check out Razornate - Premium Barber Booking',
  url,
  type = 'general',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = url || window.location.href
  const shareText = type === 'review' 
    ? `I just had an amazing experience at Razornate! ${text}`
    : type === 'appointment'
    ? `Just booked my appointment at Razornate! ${text}`
    : text

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    let shareLink = ''

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`
        break
      case 'native':
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
          navigator.share({
            title,
            text: shareText,
            url: shareUrl,
          })
          return
        }
        break
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
        return
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400')
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('native')}
          className="glow-gold-hover"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="hover:bg-blue-600 hover:border-blue-600"
      >
        <Facebook className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="hover:bg-blue-400 hover:border-blue-400"
      >
        <Twitter className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="hover:bg-green-600 hover:border-green-600"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('copy')}
        className="glow-gold-hover"
      >
        {copied ? (
          <span className="text-green-500">Copied!</span>
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
}




