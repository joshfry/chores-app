/**
 * Import Database Data
 * Imports data from JSON export into the database
 *
 * Usage: node scripts/import-data.js < data-export.json
 * Or: node scripts/import-data.js data-export.json
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const prisma = new PrismaClient()

async function importData(jsonData) {
  console.log('📥 Importing database data...\n')

  try {
    const data = JSON.parse(jsonData)

    // Track ID mappings (old ID -> new ID)
    const userIdMap = {}
    const choreIdMap = {}

    // Import families and their related data
    for (const family of data.families) {
      console.log(`📁 Importing family: ${family.name}`)

      // Create family (we'll update primaryParentId later)
      const createdFamily = await prisma.family.create({
        data: {
          name: family.name,
          primaryParentId: 1, // Temporary, will update after creating users
          createdDate: new Date(family.createdDate),
        },
      })

      // Create users and map old IDs to new IDs
      for (const user of family.users) {
        console.log(`  👤 Importing user: ${user.name} (${user.email})`)
        const createdUser = await prisma.user.create({
          data: {
            email: user.email,
            role: user.role,
            familyId: createdFamily.id,
            name: user.name,
            birthdate: user.birthdate,
            createdBy: user.createdBy,
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
            isActive: user.isActive,
          },
        })
        userIdMap[user.id] = createdUser.id
      }

      // Update family with correct primary parent ID
      const newPrimaryParentId = userIdMap[family.primaryParentId]
      if (newPrimaryParentId) {
        await prisma.family.update({
          where: { id: createdFamily.id },
          data: { primaryParentId: newPrimaryParentId },
        })
      }

      // Create chores and map old IDs to new IDs
      for (const chore of family.chores) {
        console.log(`  📋 Importing chore: ${chore.title}`)
        const createdChore = await prisma.chore.create({
          data: {
            title: chore.title,
            description: chore.description,
            category: chore.category,
            isRecurring: chore.isRecurring,
            recurrenceDays: chore.recurrenceDays,
            familyId: createdFamily.id,
          },
        })
        choreIdMap[chore.id] = createdChore.id
      }

      // Create assignments with assignment chores
      for (const assignment of family.assignments) {
        const newChildId = userIdMap[assignment.childId]
        console.log(
          `  📝 Importing assignment for child ${newChildId} (was ${assignment.childId})`,
        )
        await prisma.assignment.create({
          data: {
            childId: newChildId,
            startDate: assignment.startDate,
            endDate: assignment.endDate,
            status: assignment.status,
            notes: assignment.notes,
            familyId: createdFamily.id,
            assignmentChores: {
              create: assignment.assignmentChores.map((ac) => ({
                choreId: choreIdMap[ac.choreId],
                status: ac.status,
                completedOn: ac.completedOn,
              })),
            },
          },
        })
      }
    }

    // Import magic tokens with mapped user IDs
    console.log(`\n🔑 Importing ${data.magicTokens.length} magic tokens`)
    for (const token of data.magicTokens) {
      const newUserId = userIdMap[token.userId]
      if (newUserId) {
        await prisma.magicToken.create({
          data: {
            userId: newUserId,
            token: token.token,
            expiresAt: new Date(token.expiresAt),
            used: token.used,
          },
        })
      }
    }

    // Import WebAuthn credentials with mapped user IDs
    console.log(
      `🔐 Importing ${data.webAuthnCredentials.length} webauthn credentials`,
    )
    for (const cred of data.webAuthnCredentials) {
      const newUserId = userIdMap[cred.userId]
      if (newUserId) {
        await prisma.webAuthnCredential.create({
          data: {
            userId: newUserId,
            credentialId: cred.credentialId,
            publicKey: cred.publicKey,
            deviceName: cred.deviceName,
            counter: cred.counter,
            createdAt: new Date(cred.createdAt),
          },
        })
      }
    }

    console.log('\n✅ Import complete!')
    console.log(`   ${data.families.length} families imported`)
  } catch (error) {
    console.error('❌ Error importing data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Read from file or stdin
if (process.argv[2]) {
  // Read from file
  const jsonData = fs.readFileSync(process.argv[2], 'utf-8')
  importData(jsonData).catch((error) => {
    console.error(error)
    process.exit(1)
  })
} else {
  // Read from stdin
  let jsonData = ''
  process.stdin.setEncoding('utf-8')
  process.stdin.on('data', (chunk) => {
    jsonData += chunk
  })
  process.stdin.on('end', () => {
    importData(jsonData).catch((error) => {
      console.error(error)
      process.exit(1)
    })
  })
}
