/**
 * Export Database Data
 * Exports all data from the database as JSON
 *
 * Usage: node scripts/export-data.js > data-export.json
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function exportData() {
  try {
    console.error('📦 Exporting database data...\n')

    const data = {
      families: await prisma.family.findMany({
        include: {
          users: true,
          chores: true,
          assignments: {
            include: {
              assignmentChores: true,
            },
          },
        },
      }),
      magicTokens: await prisma.magicToken.findMany(),
      webAuthnCredentials: await prisma.webAuthnCredential.findMany(),
    }

    console.error(`✅ Exported ${data.families.length} families`)
    console.error(
      `✅ Exported ${data.families.reduce((sum, f) => sum + f.users.length, 0)} users`,
    )
    console.error(
      `✅ Exported ${data.families.reduce((sum, f) => sum + f.chores.length, 0)} chores`,
    )
    console.error(
      `✅ Exported ${data.families.reduce((sum, f) => sum + f.assignments.length, 0)} assignments`,
    )
    console.error(`✅ Exported ${data.magicTokens.length} magic tokens`)
    console.error(
      `✅ Exported ${data.webAuthnCredentials.length} webauthn credentials\n`,
    )

    console.error('📤 Writing JSON to stdout...')

    // Output JSON to stdout (can be redirected to file)
    console.log(JSON.stringify(data, null, 2))

    console.error('✅ Export complete!')
  } catch (error) {
    console.error('❌ Error exporting data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

exportData().catch((error) => {
  console.error(error)
  process.exit(1)
})
