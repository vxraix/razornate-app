'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Scissors, X, Edit, RotateCcw, Star } from 'lucide-react'
import { formatDate, formatTime, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import { LoyaltyDisplay } from '@/app/components/loyalty-display'
import { motion } from 'framer-motion'
import { RescheduleModal } from '@/components/reschedule-modal'
import { ReviewModal } from '@/components/review-modal'
import { AppointmentTimeline } from '@/components/appointment-timeline'
import { PhotoGallery } from '@/components/photo-gallery'
import { PushNotificationSetup } from '@/components/push-notification-setup'
import { ReferralProgram } from '@/components/referral-program'
import { AftercareNotes } from '@/components/aftercare-notes'
import { SocialShare } from '@/components/social-share'

interface Appointment {
  id: string
  date: string
  status: string
  notes: string | null
  service: {
    id: string
    name: string
    price: number
    duration: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null)
  const [reviewAppointment, setReviewAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated' && session) {
      fetchAppointments()
    }
  }, [session, status, router])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      const data = await response.json()
      if (response.ok) {
        setAppointments(data)
      }
      
      // Fetch user loyalty points
      const userResponse = await fetch('/api/user/profile')
      const userData = await userResponse.json()
      if (userResponse.ok && userData.loyaltyPoints !== undefined) {
        setLoyaltyPoints(userData.loyaltyPoints)
      }
    } catch (error) {
      toast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel appointment')
      }

      toast.success('Appointment cancelled')
      fetchAppointments()
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel appointment')
    }
  }

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) > new Date() && apt.status !== 'CANCELLED'
  )
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.date) <= new Date() || apt.status === 'CANCELLED'
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Confirmed</Badge>
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>
      case 'COMPLETED':
        return <Badge variant="secondary">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12 relative">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <Navbar />
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Dashboard
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage your appointments</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/book">
              <Button className="mt-4 md:mt-0 glow-gold-hover relative overflow-hidden group">
                <span className="relative z-10 flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Book New Appointment
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Notifications & Referrals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <PushNotificationSetup />
          </motion.div>
        </div>

        {/* Loyalty Points */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LoyaltyDisplay points={loyaltyPoints} />
        </motion.div>

        {/* Referral Program */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ReferralProgram />
        </motion.div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Upcoming Appointments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="h-full hover:border-gold-500/50 transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-gold-500" />
                            {appointment.service.name}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {formatDateTime(appointment.date)}
                          </CardDescription>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {appointment.service.duration} minutes
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Price: </span>
                          <span className="text-gold-500 font-semibold">
                            ${appointment.service.price.toFixed(2)}
                          </span>
                        </div>
                        {appointment.notes && (
                          <div className="pt-3 border-t border-gray-800">
                            <p className="text-sm text-gray-400">
                              <span className="text-gray-500">Notes: </span>
                              {appointment.notes}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRescheduleAppointment(appointment)}
                            className="flex-1"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(appointment.id)}
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Appointment Timeline */}
        {appointments.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Appointment History</h2>
            <AppointmentTimeline appointments={appointments} />
          </motion.div>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Past Appointments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pastAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="h-full hover:border-gold-500/50 transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-gold-500" />
                            {appointment.service.name}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {formatDateTime(appointment.date)}
                          </CardDescription>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {appointment.service.duration} minutes
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Price: </span>
                          <span className="text-gold-500 font-semibold">
                            ${appointment.service.price.toFixed(2)}
                          </span>
                        </div>
                        {appointment.status === 'COMPLETED' && (
                          <div className="space-y-2 pt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReviewAppointment(appointment)}
                              className="w-full glow-gold-hover"
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Leave a Review
                            </Button>
                            <PhotoGallery
                              appointmentId={appointment.id}
                              canUpload={true}
                            />
                            <AftercareNotes appointmentId={appointment.id} />
                            <div className="pt-2">
                              <p className="text-xs text-gray-500 mb-2">Share this appointment:</p>
                              <SocialShare
                                type="appointment"
                                text={`I just completed: ${appointment.service.name}`}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {appointments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent className="py-12 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">No appointments yet</h3>
                <p className="text-gray-400 mb-6">Book your first appointment to get started</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/book">
                    <Button className="glow-gold-hover">Book Appointment</Button>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {rescheduleAppointment && (
        <RescheduleModal
          isOpen={!!rescheduleAppointment}
          onClose={() => setRescheduleAppointment(null)}
          appointment={{
            id: rescheduleAppointment.id,
            date: rescheduleAppointment.date,
            service: rescheduleAppointment.service,
          }}
          onReschedule={fetchAppointments}
        />
      )}

      {reviewAppointment && (
        <ReviewModal
          isOpen={!!reviewAppointment}
          onClose={() => setReviewAppointment(null)}
          appointmentId={reviewAppointment.id}
          onReviewSubmitted={fetchAppointments}
        />
      )}
    </div>
  )
}

