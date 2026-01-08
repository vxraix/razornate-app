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
    const { status, barberNotes } = body

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

