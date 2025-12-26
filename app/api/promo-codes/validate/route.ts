import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promoCode || !promoCode.isActive) {
      return NextResponse.json({ valid: false })
    }

    if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false })
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({
      valid: true,
      discount: promoCode.discount,
      isPercentage: promoCode.isPercentage,
    })
  } catch (error: any) {
    console.error('Error validating promo code:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}






