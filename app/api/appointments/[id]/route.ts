import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { service: true },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    if (appointment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { date, notes } = body

    if (date) {
      // Reschedule appointment
      const newDate = new Date(date)
      const endTime = new Date(newDate.getTime() + appointment.service.duration * 60000)

      // Check for conflicts (excluding current appointment)
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: params.id },
          date: {
            gte: newDate,
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

      await prisma.appointment.update({
        where: { id: params.id },
        data: {
          date: newDate,
          originalDate: appointment.originalDate || appointment.date,
          status: 'RESCHEDULED',
          notes: notes !== undefined ? notes : appointment.notes,
        },
        include: {
          service: true,
        },
      })
    } else {
      // Update notes only
      await prisma.appointment.update({
        where: { id: params.id },
        data: {
          notes: notes !== undefined ? notes : appointment.notes,
        },
      })
    }

    return NextResponse.json({ message: 'Appointment updated' })
  } catch (error: any) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    if (appointment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.appointment.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ message: 'Appointment cancelled' })
  } catch (error: any) {
    console.error('Error cancelling appointment:', error)
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    )
  }
}

