import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.blockedDate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Date unblocked' })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 })
  }
}






