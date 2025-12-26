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
    const { status } = body

    const waitlist = await prisma.waitlist.update({
      where: { id: params.id },
      data: {
        status: status || 'PENDING',
        notifiedAt: status === 'NOTIFIED' ? new Date() : undefined,
      },
    })

    return NextResponse.json(waitlist)
  } catch (error: any) {
    console.error('Error updating waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to update waitlist' },
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

    const waitlist = await prisma.waitlist.findUnique({
      where: { id: params.id },
    })

    if (!waitlist) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      )
    }

    if (waitlist.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.waitlist.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Removed from waitlist' })
  } catch (error: any) {
    console.error('Error deleting waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from waitlist' },
      { status: 500 }
    )
  }
}






