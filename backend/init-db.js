/**
 * Database initialization script for production
 * Runs before the server starts to ensure tables exist
 */

const { execSync } = require('child_process')
const path = require('path')

console.log('🔧 Initializing database...')

try {
  // Run db push from the correct directory
  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    cwd: __dirname,
  })
  console.log('✅ Database initialized successfully')
} catch (error) {
  console.error('❌ Database initialization failed:', error.message)
  // Don't exit - let the app try to start anyway
}
