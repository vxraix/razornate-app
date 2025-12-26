'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Scissors, AlertCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatTime } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Confetti } from '@/components/confetti'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function BookPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/book')
      return
    }
    if (status === 'authenticated' && session) {
      fetchServices()
    }
  }, [session, status, router])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      if (response.ok) {
        setServices(data)
      }
    } catch (error) {
      toast.error('Failed to load services')
    }
  }

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate || !selectedService) return

    try {
      const response = await fetch(
        `/api/appointments/availability?date=${selectedDate}&duration=${selectedService.duration}`
      )
      const data = await response.json()
      if (response.ok) {
        setTimeSlots(data.slots || [])
      }
    } catch (error) {
      toast.error('Failed to load available slots')
    }
  }, [selectedDate, selectedService])

  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots()
    }
  }, [selectedDate, selectedService, fetchAvailableSlots])

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Please select a service, date, and time')
      return
    }

    if (!session) {
      router.push('/auth/signin?callbackUrl=/book')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date: `${selectedDate}T${selectedTime}`,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment')
      }

      setShowConfetti(true)
      toast.success('Appointment booked successfully! 🎉')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate time slots (9 AM to 6 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = []
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push({ time, available: true })
      }
    }
    return slots
  }

  const applyPromoCode = async () => {
    if (!promoCode) return
    try {
      const response = await fetch(`/api/promo-codes/validate?code=${promoCode}`)
      const data = await response.json()
      if (response.ok && data.valid) {
        setDiscount(data.discount || 0)
        toast.success(`Promo code applied! ${data.isPercentage ? `${data.discount}%` : `$${data.discount}`} off`)
      } else {
        toast.error('Invalid promo code')
      }
    } catch (error) {
      toast.error('Failed to validate promo code')
    }
  }

  const finalPrice = selectedService ? (selectedService.price * (1 - discount / 100)).toFixed(2) : '0.00'

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12 relative">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {showConfetti && <Confetti />}
      <Navbar />
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Book Appointment
          </h1>
          <p className="text-gray-400 text-lg">Select your service and preferred time</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Step 1: Select Service */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-gold-500" />
                Select Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.map((service, index) => (
                <motion.button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedService?.id === service.id
                      ? 'border-gold-500 bg-gold-500/10 shadow-lg shadow-gold-500/20'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{service.name}</h3>
                    <Badge variant="default">
                      ${service.price.toFixed(2)}
                    </Badge>
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-400 mb-2">{service.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {service.duration} minutes
                  </div>
                  {selectedService?.id === service.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <Sparkles className="w-5 h-5 text-gold-500" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </CardContent>
            </Card>
          </motion.div>

          {/* Step 2: Select Date & Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-500" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Date
                </label>
                <Input
                  type="date"
                  min={today}
                  max={maxDateStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Time
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {timeSlots.length > 0 ? (
                      timeSlots.map((slot, index) => (
                        <motion.button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={slot.available ? { scale: 1.05 } : {}}
                          whileTap={slot.available ? { scale: 0.95 } : {}}
                          className={`p-2 rounded-lg text-sm border-2 transition-all relative ${
                            selectedTime === slot.time
                              ? 'border-gold-500 bg-gold-500/10 text-gold-500 shadow-lg shadow-gold-500/20'
                              : slot.available
                              ? 'border-gray-800 hover:border-gray-700 text-gray-300 hover:bg-gray-800/50'
                              : 'border-gray-900 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                          {selectedTime === slot.time && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full"
                            />
                          )}
                        </motion.button>
                      ))
                    ) : (
                      generateTimeSlots().map((slot, index) => (
                        <motion.button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-2 rounded-lg text-sm border-2 transition-all relative ${
                            selectedTime === slot.time
                              ? 'border-gold-500 bg-gold-500/10 text-gold-500 shadow-lg shadow-gold-500/20'
                              : 'border-gray-800 hover:border-gray-700 text-gray-300 hover:bg-gray-800/50'
                          }`}
                        >
                          {slot.time}
                          {selectedTime === slot.time && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-3 h-3 bg-gold-500 rounded-full"
                            />
                          )}
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            </Card>
          </motion.div>

          {/* Step 3: Add Notes & Confirm */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>Any special requests for your barber?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., Low fade, no razor, trim beard..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />

              {/* Promo Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Promo Code (Optional)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyPromoCode}
                    disabled={!promoCode}
                  >
                    Apply
                  </Button>
                </div>
                {discount > 0 && (
                  <p className="text-sm text-gold-500">
                    🎉 {discount}% discount applied!
                  </p>
                )}
              </div>

              {selectedService && selectedDate && selectedTime && (
                <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                  <h3 className="font-semibold mb-2 text-white">Booking Summary</h3>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p><span className="text-gray-500">Service:</span> {selectedService.name}</p>
                    <p><span className="text-gray-500">Date:</span> {formatDate(selectedDate)}</p>
                    <p><span className="text-gray-500">Time:</span> {selectedTime}</p>
                    <p className="pt-2 border-t border-gray-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500">Subtotal:</span>
                        <span className="text-gray-300">${selectedService.price.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between items-center mb-1 text-gold-500">
                          <span>Discount ({discount}%):</span>
                          <span>-${(selectedService.price * discount / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                        <span className="text-gray-500 font-semibold">Total:</span>
                        <span className="text-gold-500 font-bold text-lg">
                          ${finalPrice}
                        </span>
                      </div>
                    </p>
                  </div>
                </div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleBooking}
                  disabled={!selectedService || !selectedDate || !selectedTime || isLoading}
                  className="w-full relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Confirm Booking
                      </>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

