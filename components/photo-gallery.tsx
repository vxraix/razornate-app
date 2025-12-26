'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface Photo {
  id: string
  url: string
  type: string
  caption: string | null
}

interface PhotoGalleryProps {
  appointmentId: string
  canUpload?: boolean
}

export function PhotoGallery({ appointmentId, canUpload = false }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch(`/api/appointments/photos?appointmentId=${appointmentId}`)
      const data = await response.json()
      if (response.ok) {
        setPhotos(data)
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [appointmentId])

  useEffect(() => {
    fetchPhotos()
  }, [appointmentId, fetchPhotos])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, you'd upload to a storage service (S3, Cloudinary, etc.)
    // For now, we'll use a data URL (base64)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      setUploading(true)

      try {
        const response = await fetch('/api/appointments/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId,
            url: base64,
            type: 'AFTER', // or BEFORE, REFERENCE
          }),
        })

        if (response.ok) {
          toast.success('Photo uploaded!')
          fetchPhotos()
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        toast.error('Failed to upload photo')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  if (isLoading) {
    return <div className="text-center py-4 text-gray-400">Loading photos...</div>
  }

  return (
    <div className="space-y-4">
      {canUpload && (
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              className="glow-gold-hover"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </label>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No photos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:border-gold-500/50 transition-all">
                <div className="aspect-square relative">
                  <Image
                    src={photo.url}
                    alt={photo.caption || 'Appointment photo'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs bg-black/70 rounded">
                      {photo.type}
                    </span>
                  </div>
                </div>
                {photo.caption && (
                  <CardContent className="p-3">
                    <p className="text-sm text-gray-400">{photo.caption}</p>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}




