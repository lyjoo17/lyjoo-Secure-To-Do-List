require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Users
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        username: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
    console.log('Admin created:', admin)

    const user1 = await prisma.user.upsert({
      where: { email: 'user1@example.com' },
      update: {},
      create: {
        email: 'user1@example.com',
        username: 'Normal User 1',
        password: hashedPassword,
        role: 'USER',
      },
    })
    console.log('User1 created:', user1)

    const user2 = await prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: {},
      create: {
        email: 'user2@example.com',
        username: 'Normal User 2',
        password: hashedPassword,
        role: 'USER',
      },
    })
    console.log('User2 created:', user2)

    // Todos for User 1
    await prisma.todo.createMany({
      data: [
        {
          userId: user1.userId,
          title: 'Buy groceries',
          content: 'Milk, Bread, Eggs',
          dueDate: new Date('2025-11-30'),
          status: 'ACTIVE',
        },
        {
          userId: user1.userId,
          title: 'Finish project report',
          content: 'Complete the final draft',
          startDate: new Date('2025-11-26'),
          dueDate: new Date('2025-11-28'),
          status: 'ACTIVE',
        },
        {
          userId: user1.userId,
          title: 'Morning workout',
          status: 'COMPLETED',
          isCompleted: true,
        },
      ],
    })
    console.log('Todos for User 1 created')

    // Todos for User 2
    await prisma.todo.createMany({
      data: [
        {
          userId: user2.userId,
          title: 'Call mom',
          status: 'ACTIVE',
        },
        {
          userId: user2.userId,
          title: 'Read a book',
          content: 'Chapter 1-3',
          status: 'ACTIVE',
        },
      ],
    })
    console.log('Todos for User 2 created')

    // Holidays (2025)
    await prisma.holiday.createMany({
      data: [
        {
          title: '신정',
          date: new Date('2025-01-01'),
          description: 'New Year\'s Day',
          isRecurring: true,
        },
        {
          title: '삼일절',
          date: new Date('2025-03-01'),
          description: 'Independence Movement Day',
          isRecurring: true,
        },
        {
          title: '어린이날',
          date: new Date('2025-05-05'),
          description: 'Children\'s Day',
          isRecurring: true,
        },
        {
          title: '부처님오신날',
          date: new Date('2025-05-06'), // Example date, needs verification for lunar calendar
          description: 'Buddha\'s Birthday',
          isRecurring: true,
        },
        {
          title: '현충일',
          date: new Date('2025-06-06'),
          description: 'Memorial Day',
          isRecurring: true,
        },
        {
          title: '광복절',
          date: new Date('2025-08-15'),
          description: 'Liberation Day',
          isRecurring: true,
        },
        {
          title: '개천절',
          date: new Date('2025-10-03'),
          description: 'National Foundation Day',
          isRecurring: true,
        },
        {
          title: '한글날',
          date: new Date('2025-10-09'),
          description: 'Hangeul Proclamation Day',
          isRecurring: true,
        },
        {
          title: '크리스마스',
          date: new Date('2025-12-25'),
          description: 'Christmas Day',
          isRecurring: true,
        },
      ],
      skipDuplicates: true,
    })
    console.log('Holidays created')
    
    console.log('Seed data created successfully.')
  } catch(e) {
    console.error("Error in main:", e)
    throw e
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })