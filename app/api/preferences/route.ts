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

    const preferences = await prisma.clientPreference.findMany({
      where: { userId: session.user.id },
    })

    // Convert to key-value object
    const prefs: Record<string, string> = {}
    preferences.forEach((p) => {
      prefs[p.key] = p.value
    })

    return NextResponse.json(prefs)
  } catch (error: any) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
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
    const { key, value } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      )
    }

    const preference = await prisma.clientPreference.upsert({
      where: {
        userId_key: {
          userId: session.user.id,
          key,
        },
      },
      update: {
        value: value || '',
      },
      create: {
        userId: session.user.id,
        key,
        value: value || '',
      },
    })

    return NextResponse.json(preference)
  } catch (error: any) {
    console.error('Error saving preference:', error)
    return NextResponse.json(
      { error: 'Failed to save preference' },
      { status: 500 }
    )
  }
}






