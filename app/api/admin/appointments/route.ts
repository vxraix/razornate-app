import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const includeCancelled = searchParams.get('includeCancelled') === 'true'

    const where: any = {}
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }
    
    // Exclude cancelled appointments by default unless explicitly requested
    if (!includeCancelled) {
      where.status = {
        not: 'CANCELLED',
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            notes: true,
          },
        },
        service: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(appointments)
  } catch (error: any) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
