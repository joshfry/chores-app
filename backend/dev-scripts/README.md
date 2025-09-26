# 🛠 Backend Development Scripts

This folder contains helpful scripts for testing and developing the backend API.

## 🔐 Authentication Testing Scripts

### `test-auth-manual.sh`

Creates a new user account and shows you where to find the magic token in server logs.

**Usage:**

```bash
bash backend/dev-scripts/test-auth-manual.sh
```

**What it does:**

1. Creates a new family account
2. Tells you to check backend server logs for magic token
3. Shows you the next command to run

### `test-verify.sh`

Verifies a magic token and tests protected API endpoints.

**Usage:**

```bash
bash backend/dev-scripts/test-verify.sh <magic_token>
```

**Example:**

```bash
bash backend/dev-scripts/test-verify.sh magic_1727389671234_abc123
```

**What it does:**

1. Verifies the magic token
2. Gets a session token
3. Tests protected API endpoints
4. Shows you how to use the session token

### `test-auth.sh` (Legacy)

Original automated script - may not work due to security design.

## 🚀 Quick Start Guide

1. **Start your backend server:**

   ```bash
   pnpm dev:backend
   ```

2. **Create a test user:**

   ```bash
   bash backend/dev-scripts/test-auth-manual.sh
   ```

3. **Watch your backend terminal for magic token:**

   ```
   📧 Mock Email sent to manualtest@example.com
   🔗 Magic Link: http://localhost:3000/auth/verify?token=magic_1234567890_abcdef
   ```

4. **Copy the magic token and verify it:**

   ```bash
   bash backend/dev-scripts/test-verify.sh magic_1234567890_abcdef
   ```

5. **Use the session token for API calls:**
   ```bash
   curl -H "Authorization: Bearer session_xyz789abc" \
        -H "Accept: application/json" \
        http://localhost:3001/api/children
   ```

## 📝 Notes

- Magic tokens are logged to server console (simulating email)
- Session tokens are returned after verification
- All scripts require `jq` for pretty JSON formatting (optional)
- Scripts assume backend is running on `http://localhost:3001`

## 🔧 Prerequisites

- Backend server running (`pnpm dev:backend`)
- `jq` installed for JSON formatting (optional but recommended)
  ```bash
  # Install jq on macOS:
  brew install jq
  ```
