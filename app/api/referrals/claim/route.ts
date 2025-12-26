import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Find referral by code
    const referral = await prisma.referral.findUnique({
      where: { code },
    })

    if (!referral) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    if (referral.referredId) {
      return NextResponse.json(
        { error: 'Referral code already used' },
        { status: 400 }
      )
    }

    // Check if user email matches
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.email !== referral.referredEmail) {
      return NextResponse.json(
        { error: 'This referral code is not for your email' },
        { status: 403 }
      )
    }

    // Update referral
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        referredId: session.user.id,
        status: 'SIGNED_UP',
      },
    })

    // Award points to both users
    await prisma.user.update({
      where: { id: referral.referrerId },
      data: {
        loyaltyPoints: {
          increment: 50, // Referrer gets 50 points
        },
      },
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        loyaltyPoints: {
          increment: 25, // New user gets 25 points
        },
      },
    })

    return NextResponse.json({ success: true, message: 'Referral claimed!' })
  } catch (error: any) {
    console.error('Error claiming referral:', error)
    return NextResponse.json(
      { error: 'Failed to claim referral' },
      { status: 500 }
    )
  }
}






