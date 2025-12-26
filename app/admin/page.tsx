'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, Users, Scissors, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { formatDate, formatTime } from '@/lib/utils'
import { motion } from 'framer-motion'
import { AdvancedFilters } from '@/components/advanced-filters'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  isActive: boolean
}

interface Appointment {
  id: string
  date: string
  status: string
  notes: string | null
  user: {
    name: string | null
    email: string
    phone: string | null
  }
  service: {
    name: string
    price: number
  }
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'appointments'>('dashboard')
  const [services, setServices] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration: '30',
    price: '',
  })

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    // Debug: Log session info
    console.log('Session:', session)
    console.log('User role:', session.user?.role)
    
    // Check role - handle both string and case variations
    const userRole = String(session.user?.role || '').toUpperCase().trim()
    if (userRole !== 'ADMIN') {
      console.log('Access denied. User role:', userRole, 'Expected: ADMIN')
      console.log('Full session user:', session.user)
      // Don't redirect immediately, show a message first
      toast.error('Admin access required. Please sign in with an admin account.')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      return
    }
    fetchServices()
    fetchAppointments()
  }, [session, router])

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

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/admin/appointments')
      const data = await response.json()
      if (response.ok) {
        setAppointments(data)
      }
    } catch (error) {
      toast.error('Failed to load appointments')
    }
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services'
      const method = editingService ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      })

      if (!response.ok) {
        throw new Error('Failed to save service')
      }

      toast.success(editingService ? 'Service updated' : 'Service created')
      setShowServiceForm(false)
      setEditingService(null)
      setServiceForm({ name: '', description: '', duration: '30', price: '' })
      fetchServices()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete service')
      toast.success('Service deleted')
      fetchServices()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Failed to update appointment')
      toast.success('Appointment updated')
      fetchAppointments()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const todayAppointments = appointments.filter(
    (apt) => new Date(apt.date).toDateString() === new Date().toDateString()
  )
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) > new Date() && apt.status !== 'CANCELLED'
  )

  const totalRevenue = appointments
    .filter((apt) => apt.status === 'COMPLETED')
    .reduce((sum, apt) => sum + apt.service.price, 0)

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12 relative">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <Navbar />
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Manage your barbershop</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 overflow-x-auto">
          {(['dashboard', 'services', 'appointments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-gold-500 text-gold-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <Link href="/admin/working-hours" className="px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap">
            Working Hours
          </Link>
          <Link href="/admin/block-dates" className="px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap">
            Block Dates
          </Link>
          <Link href="/admin/schedule" className="px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap">
            Schedule
          </Link>
          <Link href="/admin/clients" className="px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap">
            Clients
          </Link>
          <Link href="/admin/analytics" className="px-6 py-3 font-medium text-gray-400 hover:text-gray-300 border-b-2 border-transparent whitespace-nowrap">
            Analytics
          </Link>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[
              { icon: Calendar, title: "Today's Appointments", value: todayAppointments.length, color: "text-white" },
              { icon: Users, title: "Upcoming", value: upcomingAppointments.length, color: "text-white" },
              { icon: DollarSign, title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "text-gold-500" },
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full hover:border-gold-500/50 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <stat.icon className="w-5 h-5 text-gold-500" />
                      {stat.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className={`text-3xl font-bold ${stat.color}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                    >
                      {stat.value}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Services</h2>
              <Button onClick={() => setShowServiceForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            {showServiceForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{editingService ? 'Edit Service' : 'New Service'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <Input
                      placeholder="Service name"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      required
                    />
                    <Textarea
                      placeholder="Description"
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, description: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Duration (minutes)"
                        value={serviceForm.duration}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, duration: e.target.value })
                        }
                        required
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={serviceForm.price}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, price: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingService ? 'Update' : 'Create'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowServiceForm(false)
                          setEditingService(null)
                          setServiceForm({ name: '', description: '', duration: '30', price: '' })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="h-full hover:border-gold-500/50 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{service.name}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                      <Badge variant={service.isActive ? 'default' : 'secondary'}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">
                          Duration: {service.duration} min
                        </p>
                        <p className="text-lg font-semibold text-gold-500">
                          ${service.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingService(service)
                            setServiceForm({
                              name: service.name,
                              description: service.description || '',
                              duration: service.duration.toString(),
                              price: service.price.toString(),
                            })
                            setShowServiceForm(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mb-6">All Appointments</h2>
            <div className="mb-6">
              <AdvancedFilters
                onFilter={(filters) => {
                  // Filter logic can be added here
                  console.log('Filters:', filters)
                }}
                services={services}
                showSearch={true}
                showStatus={true}
                showService={true}
                showDateRange={true}
              />
            </div>
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5, scale: 1.01 }}
                >
                  <Card className="hover:border-gold-500/50 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Scissors className="w-5 h-5 text-gold-500" />
                          {appointment.service.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {formatDate(appointment.date)} at {formatTime(appointment.date)}
                        </CardDescription>
                      </div>
                      {appointment.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateAppointmentStatus(appointment.id, 'CONFIRMED')
                            }
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateAppointmentStatus(appointment.id, 'CANCELLED')
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge>{appointment.status}</Badge>
                        <span className="text-sm text-gray-400">
                          {appointment.user.name || appointment.user.email}
                        </span>
                        {appointment.user.phone && (
                          <span className="text-sm text-gray-500">
                            • {appointment.user.phone}
                          </span>
                        )}
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-400">
                          <span className="text-gray-500">Notes: </span>
                          {appointment.notes}
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="text-gray-500">Price: </span>
                        <span className="text-gold-500 font-semibold">
                          ${appointment.service.price.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

