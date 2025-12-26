import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const duration = parseInt(searchParams.get('duration') || '30')

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    const selectedDate = new Date(date)
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Check if date is blocked
    const isBlocked = await prisma.blockedDate.findUnique({
      where: { date: selectedDate },
    })

    if (isBlocked) {
      return NextResponse.json({ slots: [] })
    }

    // Get existing appointments for the day
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        service: true,
      },
    })

    // Generate time slots (9 AM to 6 PM, 30-minute intervals)
    const slots: { time: string; available: boolean }[] = []
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const slotStart = new Date(selectedDate)
        slotStart.setHours(hour, minute, 0, 0)
        const slotEnd = new Date(slotStart.getTime() + duration * 60000)

        // Check if slot conflicts with existing appointments
        const hasConflict = appointments.some((apt) => {
          const aptStart = new Date(apt.date)
          const aptEnd = new Date(aptStart.getTime() + apt.service.duration * 60000)
          return (
            (slotStart >= aptStart && slotStart < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd) ||
            (slotStart <= aptStart && slotEnd >= aptEnd)
          )
        })

        slots.push({
          time,
          available: !hasConflict && slotStart > new Date(),
        })
      }
    }

    return NextResponse.json({ slots })
  } catch (error: any) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

