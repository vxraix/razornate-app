'use client'

import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react'
import Link from 'next/link'

interface SocialLinksProps {
  className?: string
}

export function SocialLinks({ className = '' }: SocialLinksProps) {
  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-500' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-500' },
  ]

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socialLinks.map((social) => (
        <Link
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-gray-400 ${social.color} transition-colors`}
          aria-label={social.label}
        >
          <social.icon className="w-5 h-5" />
        </Link>
      ))}
    </div>
  )
}

