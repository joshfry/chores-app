/**
 * Clear Database Script
 * Deletes ALL data from the database (use with extreme caution!)
 *
 * Usage: npx tsx scripts/clear-database.ts
 */

import { prisma } from '../lib/prisma'

async function clearDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data from the database!')
  console.log('🔄 Starting database clear...\n')

  try {
    // Delete in correct order to respect foreign key constraints
    console.log('🗑️  Deleting AssignmentChores...')
    const deletedAssignmentChores = await prisma.assignmentChore.deleteMany()
    console.log(
      `   ✅ Deleted ${deletedAssignmentChores.count} assignment chores`,
    )

    console.log('🗑️  Deleting Assignments...')
    const deletedAssignments = await prisma.assignment.deleteMany()
    console.log(`   ✅ Deleted ${deletedAssignments.count} assignments`)

    console.log('🗑️  Deleting Chores...')
    const deletedChores = await prisma.chore.deleteMany()
    console.log(`   ✅ Deleted ${deletedChores.count} chores`)

    console.log('🗑️  Deleting WebAuthn Credentials...')
    const deletedCredentials = await prisma.webAuthnCredential.deleteMany()
    console.log(`   ✅ Deleted ${deletedCredentials.count} credentials`)

    console.log('🗑️  Deleting Magic Tokens...')
    const deletedTokens = await prisma.magicToken.deleteMany()
    console.log(`   ✅ Deleted ${deletedTokens.count} tokens`)

    console.log('🗑️  Deleting Users...')
    const deletedUsers = await prisma.user.deleteMany()
    console.log(`   ✅ Deleted ${deletedUsers.count} users`)

    console.log('🗑️  Deleting Families...')
    const deletedFamilies = await prisma.family.deleteMany()
    console.log(`   ✅ Deleted ${deletedFamilies.count} families`)

    console.log('\n✅ Database cleared successfully!')
    console.log('🎉 All tables are now empty')
  } catch (error) {
    console.error('❌ Error clearing database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
clearDatabase().catch((error) => {
  console.error(error)
  process.exit(1)
})
