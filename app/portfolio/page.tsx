'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface PortfolioImage {
  id: string
  url: string
  title: string | null
  caption: string | null
}

export default function PortfolioPage() {
  const [images, setImages] = useState<PortfolioImage[]>([])
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null)

  useEffect(() => {
    // In a real app, fetch from API
    // For now, using placeholder images
    setImages([
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800',
        title: 'Classic Fade',
        caption: 'Clean fade with precision styling',
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800',
        title: 'Beard Trim',
        caption: 'Professional beard shaping',
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        title: 'Premium Cut',
        caption: 'Deluxe grooming experience',
      },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12">
      <Navbar />
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Portfolio</h1>
          <p className="text-gray-400 text-lg">Our latest work and styles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card
              key={image.id}
              className="overflow-hidden cursor-pointer hover:border-gold-500 transition-all duration-300"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square relative bg-gray-900">
                <Image
                  src={image.url}
                  alt={image.title || 'Portfolio image'}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {image.title && (
                      <h3 className="text-white font-semibold mb-1">{image.title}</h3>
                    )}
                    {image.caption && (
                      <p className="text-gray-300 text-sm">{image.caption}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {images.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No portfolio images yet</h3>
              <p className="text-gray-400">Check back soon for our latest work</p>
            </CardContent>
          </Card>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl w-full relative" onClick={(e) => e.stopPropagation()}>
              <div className="relative w-full aspect-auto">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.title || 'Portfolio image'}
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              {(selectedImage.title || selectedImage.caption) && (
                <div className="mt-4 text-center">
                  {selectedImage.title && (
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {selectedImage.title}
                    </h3>
                  )}
                  {selectedImage.caption && (
                    <p className="text-gray-400">{selectedImage.caption}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}




