/**
 * Development Seed Script
 * Clears database and imports development data
 *
 * Usage: npm run db:seed
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedDevelopment() {
  console.log('🌱 Seeding development database...\n')

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await prisma.assignmentChore.deleteMany()
    await prisma.assignment.deleteMany()
    await prisma.chore.deleteMany()
    await prisma.webAuthnCredential.deleteMany()
    await prisma.magicToken.deleteMany()
    await prisma.user.deleteMany()
    await prisma.family.deleteMany()
    console.log('   ✅ Database cleared\n')

    // Create Fry family
    console.log('👨‍👩‍👧‍👦 Creating Fry family...')
    const family = await prisma.family.create({
      data: {
        name: 'Fry',
        primaryParentId: 1, // Will update after creating users
      },
    })

    // Create users
    console.log('👤 Creating users...')
    const josh = await prisma.user.create({
      data: {
        email: 'joshdfry@me.com',
        name: 'Josh',
        role: 'parent',
        familyId: family.id,
        birthdate: '1984-03-05',
        isActive: true,
        lastLogin: new Date(),
      },
    })

    const lori = await prisma.user.create({
      data: {
        email: 'lori.fry@me.com',
        name: 'Lori',
        role: 'parent',
        familyId: family.id,
        birthdate: '1980-07-30',
        isActive: true,
        lastLogin: new Date(),
      },
    })

    const jackson = await prisma.user.create({
      data: {
        email: 'jackson.fry@icloud.com',
        name: 'Jackson',
        role: 'child',
        familyId: family.id,
        birthdate: '2011-02-02',
        isActive: true,
        lastLogin: new Date(),
      },
    })

    const jett = await prisma.user.create({
      data: {
        email: 'jett.fry@icloud.com',
        name: 'Jett',
        role: 'child',
        familyId: family.id,
        birthdate: '2016-01-21',
        isActive: true,
        lastLogin: new Date(),
      },
    })

    const elsie = await prisma.user.create({
      data: {
        email: 'elsie.fry@icloud.com',
        name: 'Elsie',
        role: 'child',
        familyId: family.id,
        birthdate: '2019-10-18',
        isActive: true,
        lastLogin: new Date(),
      },
    })

    // Update family with primary parent
    await prisma.family.update({
      where: { id: family.id },
      data: { primaryParentId: josh.id },
    })

    console.log(`   ✅ Created ${family.name} family`)
    console.log(`   ✅ Created 5 users (2 parents, 3 children)\n`)

    // Create chores
    console.log('📋 Creating chores...')
    const chores = [
      {
        title: 'Empty Recycle',
        isRecurring: true,
        recurrenceDays: '["everyday"]',
      },
      {
        title: 'Empty Downstairs Trash',
        isRecurring: true,
        recurrenceDays: '["monday"]',
      },
      {
        title: 'Arrow HW',
        isRecurring: true,
        recurrenceDays: '["monday","tuesday","wednesday"]',
      },
      { title: 'Mail', isRecurring: true, recurrenceDays: '["everyday"]' },
      {
        title: 'Pick Up Downstairs Floor',
        isRecurring: true,
        recurrenceDays: '["monday"]',
      },
      {
        title: 'PM Reading',
        isRecurring: true,
        recurrenceDays: '["monday","tuesday","wednesday"]',
      },
      {
        title: 'Empty Dishwasher',
        isRecurring: true,
        recurrenceDays:
          '["monday","tuesday","wednesday","thursday","saturday"]',
      },
      { title: 'Walk Yoshi', isRecurring: true, recurrenceDays: '["monday"]' },
      {
        title: 'Empty Upstairs Trash',
        isRecurring: true,
        recurrenceDays: '["tuesday"]',
      },
      {
        title: 'School Room',
        isRecurring: true,
        recurrenceDays: '["tuesday"]',
      },
      { title: 'Laundry', isRecurring: true, recurrenceDays: '["tuesday"]' },
      {
        title: 'Wipe: Fridge, Trash, Oven, DW',
        isRecurring: true,
        recurrenceDays: '["wednesday"]',
      },
      {
        title: 'Mop Downstairs',
        isRecurring: true,
        recurrenceDays: '["wednesday"]',
      },
      {
        title: 'Clean Windows',
        isRecurring: true,
        recurrenceDays: '["friday"]',
      },
      {
        title: 'Clean Sliding Glass Door',
        isRecurring: false,
        recurrenceDays: null,
      },
      {
        title: 'School Room Reset',
        isRecurring: true,
        recurrenceDays: '["friday"]',
      },
      {
        title: 'Bathrooms Reset',
        isRecurring: true,
        recurrenceDays: '["friday"]',
      },
      {
        title: 'Deep Clean Microwave',
        isRecurring: true,
        recurrenceDays: '["friday"]',
      },
      {
        title: 'Water Plants',
        isRecurring: true,
        recurrenceDays: '["saturday"]',
      },
      {
        title: 'Clean Lower Cabinets',
        isRecurring: true,
        recurrenceDays: '["saturday"]',
      },
      {
        title: 'Pick Up (Something)',
        isRecurring: true,
        recurrenceDays: '["saturday"]',
      },
    ]

    for (const chore of chores) {
      await prisma.chore.create({
        data: {
          ...chore,
          familyId: family.id,
        },
      })
    }

    console.log(`   ✅ Created ${chores.length} chores\n`)

    console.log('✅ Development database seeded successfully!\n')
    console.log('📊 Summary:')
    console.log(`   • Family: ${family.name}`)
    console.log(`   • Parents: Josh, Lori`)
    console.log(`   • Children: Jackson, Jett, Elsie`)
    console.log(`   • Chores: ${chores.length}`)
    console.log(`   • Ready for testing! 🎉\n`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedDevelopment().catch((error) => {
  console.error(error)
  process.exit(1)
})
