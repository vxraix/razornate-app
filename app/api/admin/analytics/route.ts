import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'month'

    const now = new Date()
    let startDate = new Date()

    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Total Revenue
    const payments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: startDate },
      },
    })
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

    // Total Appointments
    const totalAppointments = await prisma.appointment.count({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
    })

    // Active Clients
    const activeClients = await prisma.appointment.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      select: { userId: true },
      distinct: ['userId'],
    })

    // Average Rating
    const reviews = await prisma.review.findMany({
      where: {
        createdAt: { gte: startDate },
        isVisible: true,
      },
    })
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    // Revenue Trend
    const revenueTrend = []
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 365
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const dayPayments = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      })

      revenueTrend.push({
        date: date.toISOString().split('T')[0],
        revenue: dayPayments.reduce((sum, p) => sum + p.amount, 0),
      })
    }

    // Service Popularity
    const serviceBookings = await prisma.appointment.groupBy({
      by: ['serviceId'],
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      _count: { id: true },
    })

    const services = await prisma.service.findMany({
      where: { id: { in: serviceBookings.map((s) => s.serviceId) } },
    })

    const servicePopularity = serviceBookings.map((booking) => {
      const service = services.find((s) => s.id === booking.serviceId)
      return {
        name: service?.name || 'Unknown',
        count: booking._count.id,
      }
    })

    // Appointments Over Time
    const appointmentsOverTime = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const count = await prisma.appointment.count({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          status: { not: 'CANCELLED' },
        },
      })

      appointmentsOverTime.push({
        date: date.toISOString().split('T')[0],
        appointments: count,
      })
    }

    return NextResponse.json({
      totalRevenue,
      totalAppointments,
      activeClients: activeClients.length,
      averageRating,
      revenueTrend,
      servicePopularity,
      appointmentsOverTime,
    })
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}






