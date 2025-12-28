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
    const { notes, loyaltyPoints, loyaltyPointsAdjustment } = body

    const updateData: any = {}
    if (notes !== undefined) updateData.notes = notes
    
    // Handle loyalty points adjustment
    if (loyaltyPoints !== undefined) {
      // Set absolute value
      updateData.loyaltyPoints = Math.max(0, loyaltyPoints) // Ensure non-negative
    } else if (loyaltyPointsAdjustment !== undefined) {
      // Adjust by relative amount (can be negative to remove points)
      const currentUser = await prisma.user.findUnique({
        where: { id: params.id },
        select: { loyaltyPoints: true },
      })
      if (currentUser) {
        updateData.loyaltyPoints = Math.max(0, currentUser.loyaltyPoints + loyaltyPointsAdjustment)
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}






