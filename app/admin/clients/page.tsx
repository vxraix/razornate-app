'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navbar'
import { User, Phone, Mail, Calendar, Search, Edit, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Client {
  id: string
  name: string | null
  email: string
  phone: string | null
  notes: string | null
  loyaltyPoints: number
  appointments: {
    id: string
    date: string
    status: string
    service: {
      name: string
      price: number
    }
  }[]
}

export default function ClientsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientNotes, setClientNotes] = useState('')
  const [loyaltyPointsAdjustment, setLoyaltyPointsAdjustment] = useState('')
  const [loyaltyPointsSet, setLoyaltyPointsSet] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchClients()
  }, [session, router])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients')
      const data = await response.json()
      if (response.ok) {
        setClients(data)
      }
    } catch (error) {
      toast.error('Failed to load clients')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedClient) return

    try {
      const response = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: clientNotes }),
      })

      if (!response.ok) throw new Error('Failed to save notes')
      toast.success('Notes saved')
      fetchClients()
      if (selectedClient) {
        setSelectedClient({ ...selectedClient, notes: clientNotes })
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleAdjustLoyaltyPoints = async (adjustment: number) => {
    if (!selectedClient) return

    try {
      const response = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loyaltyPointsAdjustment: adjustment }),
      })

      if (!response.ok) throw new Error('Failed to adjust loyalty points')
      toast.success(`Loyalty points ${adjustment >= 0 ? 'added' : 'removed'} successfully`)
      setLoyaltyPointsAdjustment('')
      fetchClients()
      // Update selected client
      const updatedClient = await response.json()
      setSelectedClient({ ...selectedClient, loyaltyPoints: updatedClient.loyaltyPoints })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleSetLoyaltyPoints = async () => {
    if (!selectedClient || !loyaltyPointsSet) return

    const points = parseInt(loyaltyPointsSet)
    if (isNaN(points) || points < 0) {
      toast.error('Please enter a valid number (0 or greater)')
      return
    }

    try {
      const response = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loyaltyPoints: points }),
      })

      if (!response.ok) throw new Error('Failed to set loyalty points')
      toast.success('Loyalty points updated successfully')
      setLoyaltyPointsSet('')
      fetchClients()
      // Update selected client
      const updatedClient = await response.json()
      setSelectedClient({ ...selectedClient, loyaltyPoints: updatedClient.loyaltyPoints })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const filteredClients = clients.filter((client) =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  )

  const totalSpent = (client: Client) => {
    return client.appointments
      .filter((apt) => apt.status === 'COMPLETED')
      .reduce((sum, apt) => sum + apt.service.price, 0)
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12">
      <Navbar />
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Clients</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your client database</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search clients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Clients List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredClients.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-400">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No clients found</p>
                </CardContent>
              </Card>
            ) : (
              filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedClient?.id === client.id
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'hover:border-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedClient(client)
                      setClientNotes(client.notes || '')
                      setLoyaltyPointsAdjustment('')
                      setLoyaltyPointsSet('')
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">
                            {client.name || 'No name'}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {client.email}
                            </div>
                            {client.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="mb-1">
                            {client.loyaltyPoints} pts
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {client.appointments.length} {client.appointments.length === 1 ? 'visit' : 'visits'}
                          </p>
                          <p className="text-xs text-gold-500 font-semibold">
                            ${totalSpent(client).toFixed(2)} spent
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Client Details */}
          <div className="lg:col-span-1">
            {selectedClient ? (
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gold-500" />
                    Client Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      {selectedClient.name || 'No name'}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedClient.email}
                      </div>
                      {selectedClient.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {selectedClient.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="font-semibold text-white mb-2">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Visits:</span>
                        <span className="text-white">{selectedClient.appointments.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Spent:</span>
                        <span className="text-gold-500 font-semibold">
                          ${totalSpent(selectedClient).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Loyalty Points:</span>
                        <span className="text-white font-semibold">{selectedClient.loyaltyPoints} pts</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="font-semibold text-white mb-3">Manage Loyalty Points</h4>
                    <div className="space-y-3">
                      {/* Quick Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustLoyaltyPoints(-10)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/50"
                          disabled={selectedClient.loyaltyPoints < 10}
                        >
                          <Minus className="w-4 h-4 mr-1" />
                          Remove 10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustLoyaltyPoints(-selectedClient.loyaltyPoints)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/50"
                          disabled={selectedClient.loyaltyPoints === 0}
                        >
                          <Minus className="w-4 h-4 mr-1" />
                          Remove All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustLoyaltyPoints(10)}
                          className="text-green-500 hover:text-green-600 hover:bg-green-500/10 border-green-500/50"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add 10
                        </Button>
                      </div>
                      
                      {/* Custom Adjustment */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Adjust Points (add/remove)</label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="e.g., -10 or +10"
                              value={loyaltyPointsAdjustment}
                              onChange={(e) => setLoyaltyPointsAdjustment(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const amount = parseInt(loyaltyPointsAdjustment)
                                if (!isNaN(amount) && amount !== 0) {
                                  handleAdjustLoyaltyPoints(amount)
                                }
                              }}
                              disabled={!loyaltyPointsAdjustment || parseInt(loyaltyPointsAdjustment) === 0}
                            >
                              Adjust
                            </Button>
                          </div>
                        </div>
                        
                        {/* Set Absolute Value */}
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Set Points (exact amount)</label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Set to specific amount"
                              value={loyaltyPointsSet}
                              onChange={(e) => setLoyaltyPointsSet(e.target.value)}
                              className="flex-1"
                              min="0"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSetLoyaltyPoints}
                              disabled={!loyaltyPointsSet}
                              className="border-gold-500 text-gold-500 hover:bg-gold-500/10"
                            >
                              Set
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="font-semibold text-white mb-2">Recent Appointments</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedClient.appointments.slice(0, 5).map((apt) => (
                        <div key={apt.id} className="text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">{formatDate(apt.date)}</span>
                            <Badge variant={apt.status === 'COMPLETED' ? 'success' : 'warning'}>
                              {apt.status}
                            </Badge>
                          </div>
                          <p className="text-gray-500 text-xs">{apt.service.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Notes
                    </h4>
                    <Textarea
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="Add notes about this client..."
                      rows={4}
                      className="mb-2"
                    />
                    <Button onClick={handleSaveNotes} size="sm" className="w-full">
                      Save Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-400">
                  <p>Select a client to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

