import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        service: true,
      },
      orderBy: {
        date: 'desc',
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, date, notes } = body

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Check for conflicts
    const appointmentDate = new Date(date)
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60000)

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        date: {
          gte: appointmentDate,
          lt: endTime,
        },
        status: {
          not: 'CANCELLED',
        },
      },
    })

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: session.user.id,
        serviceId,
        date: appointmentDate,
        notes,
        status: 'PENDING',
      },
      include: {
        service: true,
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create appointment' },
      { status: 500 }
    )
  }
}






