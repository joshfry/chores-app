#!/bin/bash

# Manual Auth Test - You need to copy magic token from server logs
API_BASE="http://localhost:3001/api"

echo "🚀 Manual Auth Test"
echo ""

# Step 1: Create account
echo "1️⃣ Creating account..."
curl -s -X POST "$API_BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "manualtest@example.com",
    "name": "Manual Test User", 
    "familyName": "Manual Test Family",
    "birthdate": "1990-05-15"
  }' | jq '.'

echo ""
echo "👀 CHECK YOUR BACKEND SERVER LOGS for the magic token!"
echo "Look for: 🔗 Magic Link: http://localhost:3000/auth/verify?token=magic_XXXXXXXXX"
echo ""
echo "Then run:"
echo "bash test-verify.sh magic_XXXXXXXXX"
echo ""
