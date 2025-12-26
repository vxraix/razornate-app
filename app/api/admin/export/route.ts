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
    const format = searchParams.get('format') || 'csv'
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

    const appointments = await prisma.appointment.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
            price: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Date',
        'Time',
        'Client Name',
        'Client Email',
        'Client Phone',
        'Service',
        'Price',
        'Status',
        'Payment Status',
        'Payment Method',
        'Notes',
      ]

      const rows = appointments.map((apt) => {
        const date = new Date(apt.date)
        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          apt.user.name || 'N/A',
          apt.user.email || 'N/A',
          apt.user.phone || 'N/A',
          apt.service.name,
          `$${apt.service.price.toFixed(2)}`,
          apt.status,
          apt.payment?.status || 'N/A',
          apt.payment?.method || 'N/A',
          apt.notes || '',
        ]
      })

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="appointments-${range}-${new Date().toISOString()}.csv"`,
        },
      })
    } else {
      // JSON format
      const jsonData = appointments.map((apt) => ({
        id: apt.id,
        date: apt.date,
        client: {
          name: apt.user.name,
          email: apt.user.email,
          phone: apt.user.phone,
        },
        service: {
          name: apt.service.name,
          price: apt.service.price,
        },
        status: apt.status,
        payment: apt.payment
          ? {
              status: apt.payment.status,
              method: apt.payment.method,
              amount: apt.payment.amount,
            }
          : null,
        notes: apt.notes,
        createdAt: apt.createdAt,
      }))

      return NextResponse.json(jsonData, {
        headers: {
          'Content-Disposition': `attachment; filename="appointments-${range}-${new Date().toISOString()}.json"`,
        },
      })
    }
  } catch (error: any) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}






