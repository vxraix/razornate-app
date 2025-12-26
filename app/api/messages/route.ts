import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')
    const userId = searchParams.get('userId')

    if (appointmentId) {
      // Get messages for specific appointment
      const messages = await prisma.message.findMany({
        where: {
          appointmentId,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      // Mark messages as read if viewing
      await prisma.message.updateMany({
        where: {
          appointmentId,
          isRead: false,
          NOT: {
            senderRole: session.user.role || 'CLIENT',
          },
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      return NextResponse.json(messages)
    }

    if (userId && session.user.role === 'ADMIN') {
      // Admin viewing conversation with specific user
      const messages = await prisma.message.findMany({
        where: {
          userId,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
              role: true,
            },
          },
          appointment: {
            select: {
              id: true,
              date: true,
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json(messages)
    }

    // Get all conversations for current user
    if (session.user.role === 'ADMIN') {
      const conversations = await prisma.message.findMany({
        distinct: ['userId'],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json(conversations)
    }

    // Client gets their own messages
    const messages = await prisma.message.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        appointment: {
          select: {
            id: true,
            date: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(messages)
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, appointmentId, content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    const targetUserId = userId || session.user.id

    // Verify user has access
    if (session.user.role !== 'ADMIN' && targetUserId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        userId: targetUserId,
        appointmentId: appointmentId || null,
        content: content.trim(),
        senderRole: session.user.role || 'CLIENT',
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            role: true,
          },
        },
      },
    })

    // Log communication
    await prisma.communicationLog.create({
      data: {
        userId: targetUserId,
        type: 'MESSAGE',
        content: content.trim(),
        direction: 'OUTBOUND',
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error: any) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}






