import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Get bank account settings (public for payment instructions)
export async function GET() {
  try {
    const bankName = await prisma.settings.findUnique({
      where: { key: 'bank_name' },
    })
    const accountNumber = await prisma.settings.findUnique({
      where: { key: 'bank_account_number' },
    })
    const accountHolder = await prisma.settings.findUnique({
      where: { key: 'bank_account_holder' },
    })

    return NextResponse.json({
      bankName: bankName?.value || '',
      accountNumber: accountNumber?.value || '',
      accountHolder: accountHolder?.value || '',
    })
  } catch (error: any) {
    console.error('Error fetching bank settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bank settings' },
      { status: 500 }
    )
  }
}

// Update bank account settings (admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bankName, accountNumber, accountHolder } = body

    // Upsert bank settings
    await prisma.settings.upsert({
      where: { key: 'bank_name' },
      update: { value: bankName || '' },
      create: { key: 'bank_name', value: bankName || '', description: 'Bank name for payments' },
    })

    await prisma.settings.upsert({
      where: { key: 'bank_account_number' },
      update: { value: accountNumber || '' },
      create: { key: 'bank_account_number', value: accountNumber || '', description: 'Bank account number' },
    })

    await prisma.settings.upsert({
      where: { key: 'bank_account_holder' },
      update: { value: accountHolder || '' },
      create: { key: 'bank_account_holder', value: accountHolder || '', description: 'Account holder name' },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating bank settings:', error)
    return NextResponse.json(
      { error: 'Failed to update bank settings' },
      { status: 500 }
    )
  }
}

