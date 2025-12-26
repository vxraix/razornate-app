import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, preferredDate, preferredTime, notes } = body

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service is required' },
        { status: 400 }
      )
    }

    const waitlist = await prisma.waitlist.create({
      data: {
        userId: session.user.id,
        serviceId,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || null,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        service: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(waitlist, { status: 201 })
  } catch (error: any) {
    console.error('Error adding to waitlist:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add to waitlist' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role === 'ADMIN') {
      // Admin sees all waitlist entries
      const waitlist = await prisma.waitlist.findMany({
        include: {
          service: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json(waitlist)
    }

    // Client sees their own waitlist entries
    const waitlist = await prisma.waitlist.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        service: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(waitlist)
  } catch (error: any) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}






