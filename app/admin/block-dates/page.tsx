'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Navbar } from '@/components/navbar'
import { Calendar, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'

export default function BlockDatesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [blockedDates, setBlockedDates] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchBlockedDates()
  }, [session, router])

  const fetchBlockedDates = async () => {
    try {
      const response = await fetch('/api/admin/blocked-dates')
      const data = await response.json()
      if (response.ok) {
        setBlockedDates(data)
      }
    } catch (error) {
      toast.error('Failed to load blocked dates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlockDate = async () => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }

    try {
      const response = await fetch('/api/admin/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, reason }),
      })

      if (!response.ok) throw new Error('Failed to block date')
      toast.success('Date blocked successfully')
      setSelectedDate('')
      setReason('')
      fetchBlockedDates()
    } catch (error: any) {
      toast.error(error.message || 'Failed to block date')
    }
  }

  const handleUnblock = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to unblock date')
      toast.success('Date unblocked')
      fetchBlockedDates()
    } catch (error: any) {
      toast.error(error.message || 'Failed to unblock date')
    }
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12">
      <Navbar />
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Block Dates</h1>
          <p className="text-gray-400">Block dates when you&apos;re unavailable</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-500" />
              Block New Date
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Reason (Optional)</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Holiday, Personal day..."
                rows={2}
              />
            </div>
            <Button onClick={handleBlockDate} disabled={!selectedDate}>
              <Plus className="w-4 h-4 mr-2" />
              Block Date
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold mb-4">Blocked Dates</h2>
          {blockedDates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-400">
                No blocked dates
              </CardContent>
            </Card>
          ) : (
            blockedDates.map((date, index) => (
              <motion.div
                key={date.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{formatDate(date.date)}</p>
                      {date.reason && (
                        <p className="text-sm text-gray-400 mt-1">{date.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblock(date.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Unblock
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}




