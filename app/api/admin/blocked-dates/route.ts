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

    const dates = await prisma.blockedDate.findMany({
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(dates)
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { date, reason } = body

    const blockedDate = await prisma.blockedDate.create({
      data: {
        date: new Date(date),
        reason: reason || null,
      },
    })

    return NextResponse.json(blockedDate, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Date is already blocked' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to block date' }, { status: 500 })
  }
}






