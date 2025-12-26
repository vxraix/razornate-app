import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, instructions, tips } = body

    if (!appointmentId || !instructions) {
      return NextResponse.json(
        { error: 'Appointment ID and instructions are required' },
        { status: 400 }
      )
    }

    const aftercare = await prisma.aftercareNote.upsert({
      where: { appointmentId },
      update: {
        instructions,
        tips: tips || null,
      },
      create: {
        appointmentId,
        instructions,
        tips: tips || null,
      },
    })

    return NextResponse.json(aftercare)
  } catch (error: any) {
    console.error('Error saving aftercare:', error)
    return NextResponse.json(
      { error: 'Failed to save aftercare notes' },
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

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Verify appointment belongs to user or user is admin
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    if (
      appointment.userId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const aftercare = await prisma.aftercareNote.findUnique({
      where: { appointmentId },
    })

    return NextResponse.json(aftercare)
  } catch (error: any) {
    console.error('Error fetching aftercare:', error)
    return NextResponse.json(
      { error: 'Failed to fetch aftercare notes' },
      { status: 500 }
    )
  }
}






