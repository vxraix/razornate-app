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

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, barberNotes, date } = body

    // Get current appointment to check status change
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        payment: true,
      },
    })

    if (!currentAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (barberNotes !== undefined) updateData.barberNotes = barberNotes
    
    // Handle date update (rescheduling)
    if (date) {
      const newDate = new Date(date)
      const endTime = new Date(newDate.getTime() + currentAppointment.service.duration * 60000)

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

      updateData.date = newDate
      updateData.originalDate = currentAppointment.originalDate || currentAppointment.date
      // Only auto-set status to RESCHEDULED if no status was explicitly provided
      // and the appointment is not already COMPLETED or CANCELLED
      if (!status && currentAppointment.status !== 'COMPLETED' && currentAppointment.status !== 'CANCELLED') {
        updateData.status = 'RESCHEDULED'
      }
    }
    
    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Handle appointment completion - create/update payment and revenue tracking
    if (status === 'COMPLETED' && currentAppointment.status !== 'COMPLETED') {
      // Check if payment exists
      let payment = currentAppointment.payment

      if (!payment) {
        // Create payment record if it doesn't exist
        payment = await prisma.payment.create({
          data: {
            appointmentId: params.id,
            amount: currentAppointment.service.price,
            method: 'BANK_TRANSFER', // Default for Suriname
            status: 'UNPAID',
          },
        })
      }

      // Award loyalty points for completed appointment (10 points per visit)
      const pointsPerVisit = parseInt(process.env.LOYALTY_POINTS_PER_VISIT || '10')
      await prisma.user.update({
        where: { id: currentAppointment.userId },
        data: {
          loyaltyPoints: {
            increment: pointsPerVisit,
          },
        },
      })

      // Revenue is only counted when appointment is COMPLETED AND payment is PAID
      // This is handled in analytics queries, not here
    }

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
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
        payment: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error: any) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
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

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Delete the appointment (cascade will handle related records)
    await prisma.appointment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}

