'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Navbar } from '@/components/navbar'
import { Clock, CheckCircle, XCircle, Phone, Mail, User, MessageSquare, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatTime, formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Appointment {
  id: string
  date: string
  status: string
  notes: string | null
  barberNotes: string | null
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
    notes: string | null
  }
  service: {
    name: string
    price: number
    duration: number
  }
}

export default function SchedulePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [barberNotes, setBarberNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/appointments?date=${selectedDate}`)
      const data = await response.json()
      if (response.ok) {
        setAppointments(data)
        if (data.length > 0 && !selectedAppointment) {
          setSelectedAppointment(data[0])
          setBarberNotes(data[0].barberNotes || '')
        }
      }
    } catch (error) {
      toast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate, selectedAppointment])

  useEffect(() => {
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchAppointments()
  }, [session, router, selectedDate, fetchAppointments])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Failed to update')
      toast.success('Status updated')
      fetchAppointments()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedAppointment) return

    try {
      const response = await fetch(`/api/admin/appointments/${selectedAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberNotes }),
      })

      if (!response.ok) throw new Error('Failed to save notes')
      toast.success('Notes saved')
      fetchAppointments()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete appointment')
      toast.success('Appointment deleted successfully')
      
      // Clear selected appointment if it was deleted
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(null)
        setBarberNotes('')
      }
      
      fetchAppointments()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete appointment')
    }
  }

  const todayAppointments = appointments.filter(
    (apt) => new Date(apt.date).toDateString() === new Date(selectedDate).toDateString()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

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

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12">
      <Navbar />
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Today&apos;s Schedule</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your appointments</p>
        </div>

        <div className="mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Schedule Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">
              {formatDate(selectedDate)}
            </h2>
            {todayAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments scheduled for this date</p>
                </CardContent>
              </Card>
            ) : (
              todayAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedAppointment?.id === appointment.id
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'hover:border-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setBarberNotes(appointment.barberNotes || '')
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-4 h-4 text-gold-500" />
                            <span className="font-semibold text-white">
                              {formatTime(appointment.date)}
                            </span>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <h3 className="font-semibold text-white mb-1">
                            {appointment.service.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2">
                            {appointment.user.name || appointment.user.email}
                          </p>
                          {appointment.notes && (
                            <p className="text-xs text-gray-500 italic">
                              &quot;{appointment.notes}&quot;
                            </p>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div>
                            <p className="text-gold-500 font-semibold">
                              ${appointment.service.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointment.service.duration} min
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAppointment(appointment.id)
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Appointment Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedAppointment ? (
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gold-500" />
                    Client Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {selectedAppointment.user.name || 'No name'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedAppointment.user.email}
                      </div>
                      {selectedAppointment.user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {selectedAppointment.user.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gold-500" />
                      Service
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      {selectedAppointment.service.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.date)}
                    </p>
                  </div>

                  {selectedAppointment.notes && (
                    <div className="pt-4 border-t border-gray-800">
                      <h4 className="font-semibold text-white mb-2">Client Notes</h4>
                      <p className="text-sm text-gray-400 italic">
                        &quot;{selectedAppointment.notes}&quot;
                      </p>
                    </div>
                  )}

                  {selectedAppointment.user.notes && (
                    <div className="pt-4 border-t border-gray-800">
                      <h4 className="font-semibold text-white mb-2">Client Preferences</h4>
                      <p className="text-sm text-gray-400">
                        {selectedAppointment.user.notes}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="font-semibold text-white mb-2">Your Notes</h4>
                    <Textarea
                      value={barberNotes}
                      onChange={(e) => setBarberNotes(e.target.value)}
                      placeholder="Add notes about this appointment..."
                      rows={3}
                      className="mb-2"
                    />
                    <Button onClick={handleSaveNotes} size="sm" className="w-full">
                      Save Notes
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-800 space-y-2">
                    <h4 className="font-semibold text-white mb-2">Quick Actions</h4>
                    {selectedAppointment.status === 'PENDING' && (
                      <Button
                        onClick={() => handleStatusChange(selectedAppointment.id, 'CONFIRMED')}
                        className="w-full"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Appointment
                      </Button>
                    )}
                    {selectedAppointment.status !== 'COMPLETED' && selectedAppointment.status !== 'CANCELLED' && (
                      <Button
                        onClick={() => handleStatusChange(selectedAppointment.id, 'COMPLETED')}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    {selectedAppointment.status !== 'CANCELLED' && (
                      <Button
                        onClick={() => handleStatusChange(selectedAppointment.id, 'CANCELLED')}
                        variant="outline"
                        className="w-full text-red-500 hover:text-red-600"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                      variant="outline"
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/50"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-400">
                  <p>Select an appointment to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}




