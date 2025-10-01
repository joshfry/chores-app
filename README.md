# 👨‍👩‍👧‍👦 Family Chores Management App

Full-stack family chores management application with passwordless authentication and chore tracking.

## 🚀 Quick Start (MOST IMPORTANT!)

### **1. Start the Backend**

```bash
# In terminal 1:
pnpm dev:backend
```

### **2. Get an Auth Token**

```bash
# In terminal 2:
bash backend/dev-scripts/test-auth-manual.sh
```

### **3. Check Server Logs for Magic Token**

Look at terminal 1 (backend) for:

```
📧 Mock Email sent to testuser@example.com
🔗 Magic Link: http://localhost:3000/auth/verify?token=magic_1234567890_abcdef
```

### **4. Get Session Token**

```bash
# Copy the magic token from step 3:
bash backend/dev-scripts/test-verify.sh magic_1234567890_abcdef
```

### **5. Use Session Token for API Calls**

```bash
# Copy session token from step 4 response:
curl -H "Authorization: Bearer session_xyz789abc" \
     -H "Accept: application/json" \
     http://localhost:3001/api/children
```

## 📋 **Common Commands (Keep This Handy!)**

### **Development**

```bash
pnpm dev:backend                 # Start backend server
pnpm start:backend              # Start backend (production mode)
pnpm test:backend               # Run backend tests
bash backend/dev-scripts/list-scripts.sh  # Show all dev scripts
```

### **Testing Authentication**

```bash
# Step 1: Create test user
bash backend/dev-scripts/test-auth-manual.sh

# Step 2: Watch backend terminal for magic token, then:
bash backend/dev-scripts/test-verify.sh <magic_token>

# Step 3: Use the session token from step 2
curl -H "Authorization: Bearer <session_token>" \
     -H "Accept: application/json" \
     http://localhost:3001/api/children
```

## 🔗 **API Endpoints Reference**

### **Public Endpoints**

- `GET /health` - Health check
- `GET /` - API documentation
- `POST /api/auth/signup` - Create family account
- `POST /api/auth/send-magic-link` - Request login link
- `GET /api/auth/verify?token=...` - Verify magic link

### **Protected Endpoints (Need Authorization Header)**

- `GET /api/auth/me` - Current user info
- `GET /api/children` - List children
- `POST /api/children` - Create child
- `GET /api/chores` - List chores
- `POST /api/chores` - Create chore
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `GET /api/dashboard/stats` - Dashboard statistics

### **Authorization Header Format**

```bash
Authorization: Bearer session_1234567890_abcdef
```

## 🏗 **Project Structure**

```
chores/
├── backend/                    # Node.js/Express API
│   ├── dev-scripts/           # 🛠 Development & testing scripts
│   │   ├── test-auth-manual.sh  # Create test user
│   │   ├── test-verify.sh      # Verify magic token
│   │   └── README.md           # Detailed script docs
│   ├── routes/                # API route handlers
│   ├── middleware/            # Custom middleware (auth, logging)
│   ├── models/                # Data models (mock data)
│   ├── tests/                 # Jest test files
│   └── package.json
├── frontend/                   # React TypeScript app
│   └── src/
└── package.json               # Monorepo root
```

## 🔐 **Authentication Flow (Important!)**

Your app uses **passwordless authentication**:

1. **User signs up** → Creates family account
2. **Magic link sent** → Email or console log
3. **User clicks link** → Gets session token
4. **Session token used** → For all API requests

**Key Point:** Magic tokens are logged to server console, NOT returned in API responses (security best practice).

### 📧 **Email Configuration (Optional)**

By default, magic links are logged to the console. To send **real emails**:

**Quick Setup (5 minutes):**

```bash
# See backend/GMAIL_QUICK_SETUP.md for step-by-step Gmail setup
# Or backend/EMAIL_SETUP.md for production options (SendGrid, Mailgun, SES)
```

**What you get:**

- ✅ Beautiful HTML email templates
- ✅ Automatic magic link delivery
- ✅ Professional sender name
- ✅ Separate templates for login vs child invitations

**Supported providers:** Gmail, SendGrid, Mailgun, Amazon SES, or any SMTP server.

## 🎯 **Key Features**

- ✅ **Passwordless Auth** - Magic links + WebAuthn support
- ✅ **Family Management** - Parent/child roles
- ✅ **Chore Tracking** - Create, assign, complete chores
- ✅ **Dashboard** - Family statistics and activity tracking
- ✅ **Comprehensive Testing** - 67 tests with high coverage (85%+)
- ✅ **JSON-Only API** - Strict content negotiation

## 🔧 **Development Setup**

### **Prerequisites**

- Node.js 18+
- pnpm (package manager)
- jq (for JSON formatting in scripts - optional)

### **Installation**

```bash
# Clone project
git clone <your-repo>
cd chores

# Install dependencies
pnpm install

# Start backend
pnpm dev:backend
```

### **Testing**

```bash
# Run all backend tests
pnpm test:backend

# Run with coverage
pnpm test:coverage

# Test auth flow
bash backend/dev-scripts/test-auth-manual.sh
```

## 🐛 **Troubleshooting**

### **Port Already in Use**

```bash
# Kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Or kill process using port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### **Can't Find Magic Token**

- Magic tokens appear in your **backend server terminal**
- Look for lines starting with `📧 Mock Email sent to...`
- The magic token is in the line `🔗 Magic Link: ...`

### **Session Token Expired**

- Go through auth flow again
- Magic tokens expire after use
- Session tokens expire after inactivity

## 📚 **More Documentation**

- **[`ai-docs/PROJECT_CONTEXT.md`](ai-docs/PROJECT_CONTEXT.md)** - Comprehensive project overview (NEW!)
- **[`ai-docs/SETUP.md`](ai-docs/SETUP.md)** - Complete setup guide for linting, formatting, CI/CD
- **[`ai-docs/`](ai-docs/)** - Complete documentation suite for developers and AI agents
- `backend/dev-scripts/README.md` - Detailed script documentation
- `backend/tests/` - Test examples and API usage
- `.cursorrules` - Project coding standards and AI guidelines

## 🛠 **Next Development Steps**

1. **Database Integration** - Replace mock data with SQLite
2. **Security Enhancements** - Add rate limiting, input validation
3. **Frontend Development** - Build React UI components
4. **Production Deployment** - Docker, CI/CD, environment configs

---

## 💡 **Quick Reference Card**

**Start Backend:** `pnpm dev:backend`  
**Get Auth Token:** `bash backend/dev-scripts/test-auth-manual.sh`  
**API Base URL:** `http://localhost:3001/api`  
**Health Check:** `http://localhost:3001/health`  
**Run Tests:** `pnpm test:backend`

**🔑 Remember:** Auth tokens are in backend terminal logs, not API responses!
