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
    const { appointmentId, rating, comment } = body

    if (!appointmentId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating (must be 1-5)' },
        { status: 400 }
      )
    }

    // Check if appointment exists and belongs to user
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    if (appointment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if appointment is completed
    if (appointment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed appointments' },
        { status: 400 }
      )
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { appointmentId },
    })

    if (existingReview) {
      // Update existing review
      const review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment || null,
        },
      })

      return NextResponse.json(review)
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        appointmentId,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create review' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (appointmentId) {
      // Get review for specific appointment
      const review = await prisma.review.findUnique({
        where: { appointmentId },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      })

      return NextResponse.json(review || null)
    }

    // Get all visible reviews
    const reviews = await prisma.review.findMany({
      where: {
        isVisible: true,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        appointment: {
          include: {
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
      take: 50,
    })

    return NextResponse.json(reviews)
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}






