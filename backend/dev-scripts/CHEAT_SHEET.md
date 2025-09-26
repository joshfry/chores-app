# 🚀 Backend Testing Cheat Sheet

**Quick copy-paste commands for testing the backend API**

## ⚡ **Super Quick Auth Flow**

```bash
# 1. Start backend (separate terminal)
pnpm dev:backend

# 2. Create test user
bash backend/dev-scripts/test-auth-manual.sh

# 3. Check backend terminal for magic token, then:
bash backend/dev-scripts/test-verify.sh magic_COPY_FROM_BACKEND_LOGS

# 4. Copy session token from response, then test:
curl -H "Authorization: Bearer session_COPY_FROM_STEP_3" \
     -H "Accept: application/json" \
     http://localhost:3001/api/children
```

## 📋 **All Available Scripts**

```bash
bash backend/dev-scripts/list-scripts.sh          # Show all scripts
bash backend/dev-scripts/test-auth-manual.sh      # Create test user
bash backend/dev-scripts/test-verify.sh TOKEN     # Verify magic token
```

## 🔗 **Useful API Endpoints**

```bash
# Health check
curl http://localhost:3001/health

# API documentation
curl http://localhost:3001/

# Protected endpoints (need Authorization header)
curl -H "Authorization: Bearer SESSION_TOKEN" -H "Accept: application/json" \
  http://localhost:3001/api/children

curl -H "Authorization: Bearer SESSION_TOKEN" -H "Accept: application/json" \
  http://localhost:3001/api/chores

curl -H "Authorization: Bearer SESSION_TOKEN" -H "Accept: application/json" \
  http://localhost:3001/api/assignments

curl -H "Authorization: Bearer SESSION_TOKEN" -H "Accept: application/json" \
  http://localhost:3001/api/dashboard/stats
```

## 🏃‍♂️ **One-Liner Commands**

```bash
# Create user and show where to find magic token
bash backend/dev-scripts/test-auth-manual.sh && echo "👀 CHECK BACKEND TERMINAL FOR MAGIC TOKEN!"

# Test all endpoints after getting session token
SESSION="session_your_token_here"
curl -H "Authorization: Bearer $SESSION" -H "Accept: application/json" http://localhost:3001/api/children
curl -H "Authorization: Bearer $SESSION" -H "Accept: application/json" http://localhost:3001/api/chores
curl -H "Authorization: Bearer $SESSION" -H "Accept: application/json" http://localhost:3001/api/assignments
```

---

**💡 Remember:** Magic tokens appear in backend terminal, NOT in API responses!
