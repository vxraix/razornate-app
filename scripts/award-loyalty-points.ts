import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const pointsPerVisit = parseInt(process.env.LOYALTY_POINTS_PER_VISIT || '10')
  
  console.log(`Awarding ${pointsPerVisit} points per completed appointment...`)

  // Find all completed appointments
  const completedAppointments = await prisma.appointment.findMany({
    where: {
      status: 'COMPLETED',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          loyaltyPoints: true,
        },
      },
    },
  })

  console.log(`Found ${completedAppointments.length} completed appointments`)

  // Group by user to count appointments per user
  const userAppointmentCounts = new Map<string, number>()
  
  for (const appointment of completedAppointments) {
    const count = userAppointmentCounts.get(appointment.userId) || 0
    userAppointmentCounts.set(appointment.userId, count + 1)
  }

  // Award points to each user
  let totalPointsAwarded = 0
  for (const [userId, count] of userAppointmentCounts.entries()) {
    const pointsToAward = count * pointsPerVisit
    const user = completedAppointments.find(apt => apt.userId === userId)?.user
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: {
          increment: pointsToAward,
        },
      },
    })

    console.log(`✅ Awarded ${pointsToAward} points to ${user?.email || userId} (${count} appointment${count > 1 ? 's' : ''})`)
    totalPointsAwarded += pointsToAward
  }

  console.log(`\n✨ Total points awarded: ${totalPointsAwarded}`)
  console.log(`✨ Users updated: ${userAppointmentCounts.size}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

