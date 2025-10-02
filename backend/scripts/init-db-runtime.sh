#!/bin/bash
# Database initialization script for Render runtime
# This ensures the database schema exists before starting the server

echo "🔍 Checking database schema..."

# Run db:push to ensure schema is up to date
# This is idempotent - safe to run multiple times
npx prisma db push --accept-data-loss --skip-generate

if [ $? -eq 0 ]; then
  echo "✅ Database schema is ready"
else
  echo "❌ Database initialization failed"
  exit 1
fi

