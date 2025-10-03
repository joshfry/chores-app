#!/usr/bin/env node
/**
 * Reset database script
 * WARNING: This deletes all data!
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const dbPath = path.join(__dirname, '../prisma/database.sqlite')

console.log('🗑️  Resetting database...')

// Delete database file if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log('✅ Deleted existing database')
} else {
  console.log('ℹ️  No existing database found')
}

// Recreate schema
console.log('🔧 Creating fresh database schema...')
execSync('npx prisma db push --accept-data-loss --skip-generate', {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
})

console.log('✅ Database reset complete!')
