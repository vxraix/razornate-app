import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Get payment details
export async function GET(
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
      include: {
        payment: true,
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Only allow user to see their own payment, or admin to see any
    if (appointment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(appointment.payment)
  } catch (error: any) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}

// Update payment (upload proof, verify, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { proofUrl, status, notes } = body

    // Get appointment to check ownership
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { payment: true },
    })

    if (!appointment || !appointment.payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const updateData: any = {}

    // Client can upload proof
    if (proofUrl && appointment.userId === session.user.id) {
      updateData.proofUrl = proofUrl
      updateData.status = 'PENDING_VERIFICATION'
    }

    // Only admin can verify payment
    if (session.user.role === 'ADMIN') {
      if (status) {
        updateData.status = status
        if (status === 'PAID') {
          updateData.verifiedAt = new Date()
          updateData.verifiedBy = session.user.id
        }
      }
      if (notes !== undefined) {
        updateData.notes = notes
      }
    } else if (status) {
      // Non-admin trying to change status
      return NextResponse.json(
        { error: 'Only admins can verify payments' },
        { status: 403 }
      )
    }

    const payment = await prisma.payment.update({
      where: { id: appointment.payment.id },
      data: updateData,
    })

    return NextResponse.json(payment)
  } catch (error: any) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}

