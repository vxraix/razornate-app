import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import webpush from 'web-push'

// Set VAPID keys (should be in environment variables)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
}

// Only set VAPID details if keys are provided
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:admin@razornate.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { userId, title, message, url } = body

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      )
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: userId ? { userId } : undefined,
    })

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify({
              title,
              message,
              url: url || '/dashboard',
              icon: '/icon-192x192.png',
            })
          )
          return { success: true, userId: subscription.userId }
        } catch (error: any) {
          // If subscription is invalid, remove it
          if (error.statusCode === 410) {
            await prisma.pushSubscription.delete({
              where: { endpoint: subscription.endpoint },
            })
          }
          return { success: false, error: error.message }
        }
      })
    )

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length

    return NextResponse.json({
      success: true,
      sent: successful,
      total: subscriptions.length,
    })
  } catch (error: any) {
    console.error('Error sending push notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}






