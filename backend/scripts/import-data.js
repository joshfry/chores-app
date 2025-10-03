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

    // Import families and their related data
    for (const family of data.families) {
      console.log(`📁 Importing family: ${family.name}`)

      // Create family
      const createdFamily = await prisma.family.create({
        data: {
          name: family.name,
          primaryParentId: family.primaryParentId,
          createdDate: new Date(family.createdDate),
        },
      })

      // Create users
      for (const user of family.users) {
        console.log(`  👤 Importing user: ${user.name} (${user.email})`)
        await prisma.user.create({
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
      }

      // Create chores
      for (const chore of family.chores) {
        console.log(`  📋 Importing chore: ${chore.title}`)
        await prisma.chore.create({
          data: {
            title: chore.title,
            description: chore.description,
            category: chore.category,
            isRecurring: chore.isRecurring,
            recurrenceDays: chore.recurrenceDays,
            familyId: createdFamily.id,
          },
        })
      }

      // Create assignments with assignment chores
      for (const assignment of family.assignments) {
        console.log(`  📝 Importing assignment for child ${assignment.childId}`)
        await prisma.assignment.create({
          data: {
            childId: assignment.childId,
            startDate: assignment.startDate,
            endDate: assignment.endDate,
            status: assignment.status,
            notes: assignment.notes,
            familyId: createdFamily.id,
            assignmentChores: {
              create: assignment.assignmentChores.map((ac) => ({
                choreId: ac.choreId,
                status: ac.status,
                completedOn: ac.completedOn,
              })),
            },
          },
        })
      }
    }

    // Import magic tokens
    console.log(`\n🔑 Importing ${data.magicTokens.length} magic tokens`)
    for (const token of data.magicTokens) {
      await prisma.magicToken.create({
        data: {
          userId: token.userId,
          token: token.token,
          expiresAt: new Date(token.expiresAt),
          used: token.used,
        },
      })
    }

    // Import WebAuthn credentials
    console.log(
      `🔐 Importing ${data.webAuthnCredentials.length} webauthn credentials`,
    )
    for (const cred of data.webAuthnCredentials) {
      await prisma.webAuthnCredential.create({
        data: {
          userId: cred.userId,
          credentialId: cred.credentialId,
          publicKey: cred.publicKey,
          deviceName: cred.deviceName,
          counter: cred.counter,
          createdAt: new Date(cred.createdAt),
        },
      })
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
