'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, X } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: {
    id: string
    date: string
    service: {
      id: string
      name: string
      duration: number
    }
  }
  onReschedule: () => void
}

interface TimeSlot {
  time: string
  available: boolean
}

export function RescheduleModal({
  isOpen,
  onClose,
  appointment,
  onReschedule,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const fetchTimeSlots = useCallback(async () => {
    if (!selectedDate) return

    setIsLoadingSlots(true)
    try {
      const response = await fetch(
        `/api/appointments/availability?date=${selectedDate}&duration=${appointment.service.duration}`
      )
      const data = await response.json()
      if (response.ok) {
        setTimeSlots(data.slots || [])
      }
    } catch (error) {
      toast.error('Failed to load available times')
    } finally {
      setIsLoadingSlots(false)
    }
  }, [selectedDate, appointment])

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchTimeSlots()
    }
  }, [selectedDate, isOpen, fetchTimeSlots])

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }

    setIsLoading(true)
    try {
      const [hours, minutes] = selectedTime.split(':')
      const newDate = new Date(selectedDate)
      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate.toISOString() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reschedule')
      }

      toast.success('Appointment rescheduled successfully!')
      onReschedule()
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reschedule appointment')
    } finally {
      setIsLoading(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return maxDate.toISOString().split('T')[0]
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl mx-4"
        >
          <Card className="glass-effect border-gold-500/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                Reschedule Appointment
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gold-500/20">
                <p className="text-sm text-gray-400 mb-2">Current Appointment</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gold-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gold-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(appointment.date)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select New Date
                  </label>
                  <input
                    type="date"
                    min={getMinDate()}
                    max={getMaxDate()}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedTime('')
                    }}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-gold-500 focus:outline-none"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select New Time
                    </label>
                    {isLoadingSlots ? (
                      <div className="text-center py-8 text-gray-400">
                        Loading available times...
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={`px-3 py-2 rounded-lg text-sm transition-all ${
                              selectedTime === slot.time
                                ? 'bg-gold-500 text-black font-semibold'
                                : slot.available
                                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                                : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReschedule}
                  disabled={!selectedDate || !selectedTime || isLoading}
                  className="flex-1 glow-gold-hover"
                >
                  {isLoading ? 'Rescheduling...' : 'Reschedule'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}




