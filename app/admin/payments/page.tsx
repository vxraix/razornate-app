'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Eye, DollarSign, Calendar, User, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatTime } from '@/lib/utils'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Payment {
  id: string
  appointmentId: string
  amount: number
  method: string | null
  status: string
  paymentReference: string | null
  proofUrl: string | null
  verifiedAt: string | null
  notes: string | null
  appointment: {
    id: string
    date: string
    status: string
    user: {
      name: string | null
      email: string
    }
    service: {
      name: string
      price: number
    }
  }
}

export default function PaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('pending')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    if (status === 'authenticated') {
      fetchPayments()
    }
  }, [session, status, router])

  const fetchPayments = async () => {
    try {
      // Fetch all appointments with payments
      const response = await fetch('/api/admin/appointments')
      const appointments = await response.json()
      
      if (response.ok) {
        // Extract payments from appointments
        const paymentsList: Payment[] = appointments
          .filter((apt: any) => apt.payment)
          .map((apt: any) => ({
            ...apt.payment,
            appointment: {
              id: apt.id,
              date: apt.date,
              status: apt.status,
              user: apt.user,
              service: apt.service,
            },
          }))
        
        setPayments(paymentsList)
      }
    } catch (error) {
      toast.error('Failed to load payments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (paymentId: string, approved: boolean) => {
    try {
      const payment = payments.find(p => p.id === paymentId)
      if (!payment) return

      const response = await fetch(`/api/payments/${payment.appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: approved ? 'PAID' : 'UNPAID',
          notes: verificationNotes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to verify payment')
      }

      toast.success(approved ? 'Payment verified successfully' : 'Payment rejected')
      setSelectedPayment(null)
      setVerificationNotes('')
      fetchPayments()
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify payment')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-600">Paid</Badge>
      case 'PENDING_VERIFICATION':
        return <Badge className="bg-yellow-600">Pending Verification</Badge>
      case 'UNPAID':
        return <Badge className="bg-gray-600">Unpaid</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredPayments = payments.filter(payment => {
    if (filter === 'pending') return payment.status === 'PENDING_VERIFICATION'
    if (filter === 'paid') return payment.status === 'PAID'
    return true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 md:py-12">
      <Navbar />
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
            Payment Verification
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Verify and manage customer payments
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
          >
            Pending ({payments.filter(p => p.status === 'PENDING_VERIFICATION').length})
          </Button>
          <Button
            variant={filter === 'paid' ? 'default' : 'outline'}
            onClick={() => setFilter('paid')}
            size="sm"
          >
            Paid ({payments.filter(p => p.status === 'PAID').length})
          </Button>
        </div>

        {/* Payments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPayments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:border-gold-500/50 transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gold-500" />
                        {payment.appointment.service.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {payment.appointment.user.name || payment.appointment.user.email}
                      </CardDescription>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <p className="text-gold-500 font-semibold">
                        ${payment.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="text-white">
                        {formatDate(payment.appointment.date)}
                      </p>
                    </div>
                    {payment.paymentReference && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Reference:</span>
                        <p className="text-white font-mono text-xs">
                          {payment.paymentReference}
                        </p>
                      </div>
                    )}
                  </div>

                  {payment.proofUrl && (
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Payment Proof
                      </Button>
                    </div>
                  )}

                  {payment.status === 'PENDING_VERIFICATION' && (
                    <div className="flex gap-2 pt-2 border-t border-gray-800">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment)
                          setVerificationNotes('')
                        }}
                        className="flex-1"
                      >
                        Verify
                      </Button>
                    </div>
                  )}

                  {payment.verifiedAt && (
                    <p className="text-xs text-gray-500">
                      Verified: {formatDate(payment.verifiedAt)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payments found</p>
            </CardContent>
          </Card>
        )}

        {/* Verification Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-2xl bg-gray-900 rounded-lg border border-gray-800 p-6"
            >
              <h2 className="text-2xl font-bold mb-4">Verify Payment</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-400">Customer</p>
                  <p className="text-white">
                    {selectedPayment.appointment.user.name || selectedPayment.appointment.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="text-gold-500 font-bold text-xl">
                    ${selectedPayment.amount.toFixed(2)}
                  </p>
                </div>
                {selectedPayment.proofUrl && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Payment Proof</p>
                    <div className="relative w-full h-64 bg-gray-800 rounded-lg overflow-hidden">
                      {selectedPayment.proofUrl.endsWith('.pdf') ? (
                        <iframe
                          src={selectedPayment.proofUrl}
                          className="w-full h-full"
                          title="Payment proof"
                        />
                      ) : (
                        <Image
                          src={selectedPayment.proofUrl}
                          alt="Payment proof"
                          fill
                          className="object-contain"
                        />
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Notes (Optional)
                  </label>
                  <Textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about this payment verification..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPayment(null)
                    setVerificationNotes('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerify(selectedPayment.id, false)}
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerify(selectedPayment.id, true)}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Payment
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

