import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('Please provide an email address')
    console.log('Usage: tsx scripts/create-admin.ts your-email@example.com')
    process.exit(1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      })
      console.log(`✅ User ${email} is now an ADMIN`)
    } else {
      const newUser = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          role: 'ADMIN',
        },
      })
      console.log(`✅ Created admin user: ${email}`)
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })






