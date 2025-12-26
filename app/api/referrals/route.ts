import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { referredEmail } = body

    if (!referredEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate unique referral code
    const code = `REF${randomBytes(4).toString('hex').toUpperCase()}`

    // Ensure user has a referral code
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.referralCode) {
      const userCode = `USER${randomBytes(4).toString('hex').toUpperCase()}`
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode: userCode },
      })
    }

    const referral = await prisma.referral.create({
      data: {
        referrerId: session.user.id,
        referredEmail,
        code,
        status: 'PENDING',
      },
    })

    return NextResponse.json(referral, { status: 201 })
  } catch (error: any) {
    console.error('Error creating referral:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create referral' },
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

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      include: {
        referrer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(referrals)
  } catch (error: any) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}






