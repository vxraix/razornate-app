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
    const { endpoint, keys } = body

    if (!endpoint || !keys) {
      return NextResponse.json(
        { error: 'Missing subscription data' },
        { status: 400 }
      )
    }

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    })

    if (existing) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      })
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          userId: session.user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error subscribing to push:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint } = body

    // Remove subscription(s) from database
    // If endpoint is provided, remove that specific one, otherwise remove all for user
    const whereClause: any = {
      userId: session.user.id,
    }
    
    if (endpoint) {
      whereClause.endpoint = endpoint
    }

    await prisma.pushSubscription.deleteMany({
      where: whereClause,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error unsubscribing from push:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
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

    // Check if user has any active subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ 
      isSubscribed: subscriptions.length > 0,
      subscriptions: subscriptions.map(sub => ({ endpoint: sub.endpoint }))
    })
  } catch (error: any) {
    console.error('Error checking subscription:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    )
  }
}






