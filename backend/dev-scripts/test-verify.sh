#!/bin/bash

# Verify magic token and test protected endpoints
API_BASE="http://localhost:3001/api"

if [ -z "$1" ]; then
  echo "❌ Usage: bash test-verify.sh <magic_token>"
  echo "Example: bash test-verify.sh magic_1727389234567_abc123"
  exit 1
fi

MAGIC_TOKEN="$1"

echo "🔐 Verifying magic token: $MAGIC_TOKEN"
echo ""

# Step 1: Verify magic token
echo "1️⃣ Verifying magic token..."
AUTH_RESPONSE=$(curl -s -X GET "$API_BASE/auth/verify?token=$MAGIC_TOKEN" \
  -H "Accept: application/json")

echo "$AUTH_RESPONSE" | jq '.'
echo ""

# Extract session token
SESSION_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.data.sessionToken // empty')

if [ -z "$SESSION_TOKEN" ] || [ "$SESSION_TOKEN" = "null" ]; then
  echo "❌ Failed to get session token. Check if magic token is valid."
  exit 1
fi

echo "✅ Session Token: $SESSION_TOKEN"
echo ""

# Step 2: Test protected endpoints
echo "2️⃣ Testing protected endpoints..."

echo "📝 Getting current user info:"
curl -s -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Accept: application/json" | jq '.'

echo ""
echo "👶 Getting children:"
curl -s -X GET "$API_BASE/children" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Accept: application/json" | jq '.'

echo ""
echo "📊 Getting dashboard stats:"
curl -s -X GET "$API_BASE/dashboard/stats" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Accept: application/json" | jq '.'

echo ""
echo "✅ Test complete!"
echo "💡 Your session token for future API calls:"
echo "   Authorization: Bearer $SESSION_TOKEN"
echo ""
echo "🔗 Example API call:"
echo "   curl -H 'Authorization: Bearer $SESSION_TOKEN' -H 'Accept: application/json' $API_BASE/children"
