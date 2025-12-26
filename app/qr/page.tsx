'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Share2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'

export default function QRCodePage() {
  const [qrValue] = useState(`${typeof window !== 'undefined' ? window.location.origin : ''}/book`)

  const handleDownload = () => {
    const svg = document.getElementById('qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = 'razornate-qr-code.png'
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Book with Razornate',
          text: 'Scan this QR code to book your appointment',
          url: qrValue,
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrValue)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12">
      <Navbar />
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">QR Code Booking</CardTitle>
            <CardDescription>
              Share this QR code for quick booking access
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="p-6 bg-white rounded-lg">
              <QRCodeSVG
                id="qr-code"
                value={qrValue}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-400 text-sm">Scan to book an appointment</p>
              <p className="text-gold-500 text-xs font-mono break-all">{qrValue}</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}






