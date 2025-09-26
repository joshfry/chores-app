#!/bin/bash

# Test Authentication Flow
API_BASE="http://localhost:3001/api"

echo "🚀 Testing Family Chores Auth Flow..."
echo ""

# Step 1: Create family account
echo "1️⃣ Creating family account..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "testfamily@example.com",
    "name": "Test Parent", 
    "familyName": "Test Family",
    "birthdate": "1985-05-15"
  }')

echo "Signup Response:"
echo "$SIGNUP_RESPONSE" | jq '.'
echo ""

# Extract magic token (assumes jq is installed)
MAGIC_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.data.magicToken // empty')

if [ -z "$MAGIC_TOKEN" ]; then
  echo "❌ Failed to get magic token. Trying to send magic link instead..."
  
  # Step 2: Send magic link for existing user
  echo "2️⃣ Requesting magic link..."
  MAGIC_RESPONSE=$(curl -s -X POST "$API_BASE/auth/send-magic-link" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{
      "email": "testfamily@example.com"
    }')
  
  echo "Magic Link Response:"
  echo "$MAGIC_RESPONSE" | jq '.'
  echo ""
  
  MAGIC_TOKEN=$(echo "$MAGIC_RESPONSE" | jq -r '.data.magicToken // empty')
fi

if [ -z "$MAGIC_TOKEN" ]; then
  echo "❌ Could not get magic token. Exiting."
  exit 1
fi

echo "📧 Magic Token: $MAGIC_TOKEN"
echo ""

# Step 3: Verify magic token and get session
echo "3️⃣ Verifying magic token..."
AUTH_RESPONSE=$(curl -s -X GET "$API_BASE/auth/verify?token=$MAGIC_TOKEN" \
  -H "Accept: application/json")

echo "Auth Verification Response:"
echo "$AUTH_RESPONSE" | jq '.'
echo ""

# Extract session token
SESSION_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.data.sessionToken // empty')

if [ -z "$SESSION_TOKEN" ]; then
  echo "❌ Failed to get session token. Exiting."
  exit 1
fi

echo "🔑 Session Token: $SESSION_TOKEN"
echo ""

# Step 4: Test protected endpoint
echo "4️⃣ Testing protected endpoint..."
CHILDREN_RESPONSE=$(curl -s -X GET "$API_BASE/children" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Accept: application/json")

echo "Children Response:"
echo "$CHILDREN_RESPONSE" | jq '.'
echo ""

# Step 5: Test current user endpoint
echo "5️⃣ Getting current user info..."
ME_RESPONSE=$(curl -s -X GET "$API_BASE/auth/me" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Accept: application/json")

echo "Current User Response:"
echo "$ME_RESPONSE" | jq '.'
echo ""

echo "✅ Auth flow test complete!"
echo "💡 Use this session token for API requests:"
echo "   Authorization: Bearer $SESSION_TOKEN"
