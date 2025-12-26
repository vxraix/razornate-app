import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hours = await prisma.workingHours.findMany({
      orderBy: { dayOfWeek: 'asc' },
    })

    return NextResponse.json(hours)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch working hours' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    for (const hour of body) {
      await prisma.workingHours.upsert({
        where: { dayOfWeek: hour.dayOfWeek },
        update: {
          startTime: hour.startTime,
          endTime: hour.endTime,
          isOpen: hour.isOpen,
        },
        create: {
          dayOfWeek: hour.dayOfWeek,
          startTime: hour.startTime,
          endTime: hour.endTime,
          isOpen: hour.isOpen,
        },
      })
    }

    return NextResponse.json({ message: 'Working hours updated' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update working hours' }, { status: 500 })
  }
}






