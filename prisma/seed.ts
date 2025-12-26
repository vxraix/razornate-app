import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default services
  const services = [
    {
      name: 'Classic Haircut',
      description: 'Traditional barber haircut with clippers and scissors',
      duration: 30,
      price: 35.00,
    },
    {
      name: 'Beard Trim',
      description: 'Professional beard shaping and trimming',
      duration: 20,
      price: 25.00,
    },
    {
      name: 'Haircut & Beard Combo',
      description: 'Complete grooming package - haircut and beard trim',
      duration: 45,
      price: 55.00,
    },
    {
      name: 'Premium Cut',
      description: 'Deluxe haircut with hot towel and styling',
      duration: 45,
      price: 50.00,
    },
    {
      name: 'Custom Service',
      description: 'Customized service tailored to your needs',
      duration: 60,
      price: 65.00,
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    })
  }

  // Create default working hours (Monday to Saturday, 9 AM - 6 PM)
  const workingDays = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isOpen: true }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isOpen: true }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isOpen: true }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isOpen: true }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isOpen: true }, // Friday
    { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isOpen: true }, // Saturday
    { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isOpen: false }, // Sunday
  ]

  for (const day of workingDays) {
    await prisma.workingHours.upsert({
      where: { dayOfWeek: day.dayOfWeek },
      update: {},
      create: day,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })






