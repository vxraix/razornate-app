'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, Scissors, CheckCircle } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Appointment {
  id: string
  date: string
  status: string
  service: {
    name: string
    price: number
    duration: number
  }
  notes: string | null
}

interface AppointmentTimelineProps {
  appointments: Appointment[]
}

export function AppointmentTimeline({ appointments }: AppointmentTimelineProps) {
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-600'
      case 'CONFIRMED':
        return 'bg-blue-600'
      case 'PENDING':
        return 'bg-yellow-600'
      case 'CANCELLED':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gold-500/20" />

      <div className="space-y-6">
        {sortedAppointments.map((appointment, index) => (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4"
          >
            {/* Timeline dot */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={`w-4 h-4 rounded-full ${getStatusColor(
                  appointment.status
                )} border-2 border-black`}
              />
              {appointment.status === 'COMPLETED' && (
                <CheckCircle className="absolute -top-1 -right-1 w-6 h-6 text-green-500" />
              )}
            </div>

            {/* Content */}
            <Card className="flex-1 glass-effect hover:border-gold-500/50 transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Scissors className="w-4 h-4 text-gold-500" />
                      <h3 className="font-semibold">{appointment.service.name}</h3>
                      <Badge
                        variant={
                          appointment.status === 'COMPLETED'
                            ? 'success'
                            : appointment.status === 'CONFIRMED'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(appointment.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(appointment.date)}
                      </div>
                      <div>
                        ${appointment.service.price.toFixed(2)}
                      </div>
                      <div>
                        {appointment.service.duration} min
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        &quot;{appointment.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {sortedAppointments.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No appointment history yet</p>
        </div>
      )}
    </div>
  )
}




