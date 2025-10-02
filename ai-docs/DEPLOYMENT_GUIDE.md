# 🚀 Deployment Guide - Family Chores App

Complete guide for deploying the Family Chores app to any hosting provider.

---

## 📋 Table of Contents

- [Quick Reference](#quick-reference)
- [Render.com Setup](#rendercom-setup-current)
- [Alternative Providers](#alternative-providers)
- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [Troubleshooting](#troubleshooting)

---

## Quick Reference

### Backend Deployment Requirements

| Requirement         | Details                         |
| ------------------- | ------------------------------- |
| **Node.js Version** | 20.10.0 (specified in `.nvmrc`) |
| **Package Manager** | npm (NOT pnpm in production)    |
| **Database**        | SQLite with persistent storage  |
| **Build Time**      | ~3-5 minutes                    |
| **Memory**          | 512MB minimum                   |

### Frontend Deployment Requirements

| Requirement      | Details                             |
| ---------------- | ----------------------------------- |
| **Type**         | Static Site (React SPA)             |
| **Build Output** | `frontend/build` directory          |
| **Build Time**   | ~3-5 minutes                        |
| **Redirects**    | SPA redirect (`/*` → `/index.html`) |

---

## Render.com Setup (Current)

### Backend Service Configuration

**Service Type:** Web Service

**Settings:**

```yaml
Name: family-chores-backend
Environment: Node
Region: Oregon (or closest to you)
Plan: Free

Root Directory: backend

Build Command:
npm install && npx prisma generate && npm run build

Pre-Deploy Command:
cd /opt/render/project/src/backend && npx prisma db push --accept-data-loss --skip-generate

Start Command:
npm start

Health Check Path: /health
```

**Environment Variables:**

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=file:/opt/render/project/src/backend/prisma/database.sqlite
FRONTEND_URL=https://your-frontend-url.onrender.com
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM_NAME=Family Chores
EMAIL_FROM=your-email@gmail.com
```

**Persistent Disk (CRITICAL):**

```
Name: database-storage
Mount Path: /opt/render/project/src/backend/prisma
Size: 1 GB (free tier)
```

### Frontend Service Configuration

**Service Type:** Static Site

**Settings:**

```yaml
Name: family-chores-frontend
Region: Oregon (or closest to you)
Plan: Free

Root Directory: frontend

Build Command:
rm -f package-lock.json && npm install --force && npm run build

Publish Directory: build
```

**Environment Variables:**

```bash
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

**Redirects/Rewrites (for React Router):**

```
Source: /*
Destination: /index.html
Action: Rewrite
```

---

## Alternative Providers

### Vercel

**Backend (API Routes):**

- Not ideal - Vercel is optimized for serverless functions
- Consider using Render, Railway, or Heroku for backend

**Frontend (Recommended for Vercel):**

```json
{
  "buildCommand": "cd frontend && npm install --force && npm run build",
  "outputDirectory": "frontend/build",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Environment Variables:

```
REACT_APP_API_URL=https://your-backend-url.com
```

### Railway.app

**Backend:**

```toml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "npm install && npx prisma generate && npm run build"

[deploy]
startCommand = "npx prisma db push --accept-data-loss --skip-generate && npm start"
healthcheckPath = "/health"
restartPolicyType = "on_failure"

[env]
NODE_ENV = "production"
```

Add persistent volume:

```
Mount Path: /app/backend/prisma
```

**Frontend:**

```toml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "npm install --force && npm run build"

[deploy]
staticSite = true
staticPath = "build"
```

### Heroku

**Backend (Procfile):**

```
web: npx prisma db push --accept-data-loss --skip-generate && npm start
```

**buildpacks:**

```bash
heroku buildpacks:add heroku/nodejs
```

**Database:**

- Use Heroku Postgres instead of SQLite
- Update `schema.prisma` to use PostgreSQL

**Frontend:**

- Deploy as separate static site on Netlify or Vercel
- Or use Heroku Static buildpack

### Fly.io

**Backend (fly.toml):**

```toml
app = "family-chores-backend"

[build]
  [build.args]
    NODE_VERSION = "20.10.0"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [[services.tcp_checks]]
    interval = 10000
    timeout = 2000
    grace_period = "30s"

[mounts]
  source = "chores_data"
  destination = "/app/backend/prisma"
```

---

## Environment Variables

### Backend Environment Variables

| Variable          | Required | Example                                  | Notes                                |
| ----------------- | -------- | ---------------------------------------- | ------------------------------------ |
| `NODE_ENV`        | Yes      | `production`                             | Sets environment mode                |
| `PORT`            | No       | `3001`                                   | Server port (auto-set by most hosts) |
| `DATABASE_URL`    | Yes      | `file:/absolute/path/to/database.sqlite` | MUST be absolute path                |
| `FRONTEND_URL`    | Yes      | `https://app.example.com`                | For CORS configuration               |
| `EMAIL_SERVICE`   | Yes      | `gmail`                                  | Email provider                       |
| `EMAIL_USER`      | Yes      | `your@gmail.com`                         | Email sender address                 |
| `EMAIL_PASS`      | Yes      | `app-password`                           | Gmail App Password                   |
| `EMAIL_FROM_NAME` | No       | `Family Chores`                          | Display name for emails              |
| `EMAIL_FROM`      | No       | `your@gmail.com`                         | From email address                   |

### Frontend Environment Variables

| Variable            | Required | Example                   | Notes           |
| ------------------- | -------- | ------------------------- | --------------- |
| `REACT_APP_API_URL` | Yes      | `https://api.example.com` | Backend API URL |

**Important Notes:**

- React environment variables MUST start with `REACT_APP_`
- Frontend env vars are baked into build at BUILD TIME (not runtime)
- Always redeploy frontend after changing env vars

---

## Database Configuration

### SQLite (Current Setup)

**Pros:**

- Simple, no external database needed
- Perfect for small to medium family use
- Free tier friendly

**Cons:**

- Requires persistent disk
- Single-server only (no horizontal scaling)
- Backup requires disk snapshots

**Configuration:**

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**Environment Variable:**

```
DATABASE_URL=file:/absolute/path/to/database.sqlite
```

**CRITICAL:** Path MUST be absolute, not relative!

### PostgreSQL (Production Alternative)

**Pros:**

- Better for production at scale
- Built-in backups
- Multiple connection support

**Cons:**

- Requires database service ($)
- More complex setup

**Migration Steps:**

1. Update `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Install PostgreSQL database (most platforms offer this)

3. Update DATABASE_URL:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

4. Run migration:

```bash
npx prisma migrate deploy
```

---

## Build Commands Explained

### Backend Build Process

```bash
# Step 1: Install dependencies
npm install

# Step 2: Generate Prisma Client (ORM)
npx prisma generate

# Step 3: Compile TypeScript to JavaScript
npm run build
```

**Output:** `dist/` directory with compiled JavaScript

### Backend Pre-Deploy Process

```bash
# Change to backend directory (schema location)
cd /opt/render/project/src/backend

# Create/update database tables from schema
npx prisma db push --accept-data-loss --skip-generate
```

**Why Pre-Deploy?**

- Runs AFTER persistent disk is mounted
- Runs BEFORE server starts
- Perfect timing for database initialization

### Backend Start Process

```bash
# Start the compiled Node.js server
npm start
# Runs: node dist/index.js
```

### Frontend Build Process

```bash
# Remove stale lockfile
rm -f package-lock.json

# Install with force (resolves peer dependency conflicts)
npm install --force

# Create production build
npm run build
# Runs: DISABLE_ESLINT_PLUGIN=true react-scripts build
```

**Output:** `build/` directory with optimized static files

---

## Troubleshooting

### Backend: "Table does not exist in current database"

**Cause:** Database tables not created

**Solutions:**

1. Check Pre-Deploy Command is set correctly
2. Verify DATABASE_URL uses absolute path
3. Check persistent disk is mounted
4. Look for Pre-Deploy errors in logs

**Debug:**

```bash
# Check if db push ran successfully in logs
grep "Database synchronized" logs

# Verify disk mount
ls /opt/render/project/src/backend/prisma/
```

### Backend: "Cannot find module"

**Cause:** Build failed or dependencies missing

**Solutions:**

1. Check Build Command completed successfully
2. Verify `npm run build` created `dist/` directory
3. Check for TypeScript compilation errors

### Frontend: "Network Error" or "CORS Error"

**Cause:** Backend URL not configured or CORS mismatch

**Solutions:**

1. Verify `REACT_APP_API_URL` is set in frontend
2. Verify `FRONTEND_URL` is set in backend
3. **IMPORTANT:** Redeploy frontend after changing env vars
4. Check both URLs match exactly (including https://)

### Frontend: Build fails with "ajv" error

**Cause:** Dependency resolution issues in monorepo

**Solutions:**

1. Use `npm install --force` in build command
2. Verify `.npmrc` exists in frontend directory
3. Clear build cache before deploying

### Backend: "Prisma schema not found"

**Cause:** Wrong working directory

**Solutions:**

1. Set Root Directory to `backend`
2. In Pre-Deploy, use `cd` to backend directory first:
   ```bash
   cd /opt/render/project/src/backend && npx prisma db push ...
   ```

### Persistent Disk: Data resets on deploy

**Cause:** Disk not properly configured

**Solutions:**

1. Verify disk mount path matches DATABASE_URL path
2. Check disk is attached to service
3. Don't run `prisma migrate reset` in production

---

## Deployment Checklist

### Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Gmail App Password generated
- [ ] Database backup strategy planned

### Backend Deployment

- [ ] Service created
- [ ] Root Directory set to `backend`
- [ ] Build Command configured
- [ ] Pre-Deploy Command configured
- [ ] Start Command configured
- [ ] All environment variables set
- [ ] Persistent disk added and mounted
- [ ] Health check endpoint working
- [ ] Logs show "Database synchronized"
- [ ] Logs show "Server listening"

### Frontend Deployment

- [ ] Service created
- [ ] Root Directory set to `frontend`
- [ ] Build Command configured
- [ ] Publish Directory set to `build`
- [ ] REACT_APP_API_URL environment variable set
- [ ] SPA redirect configured (`/*` → `/index.html`)
- [ ] Build completed successfully
- [ ] Site loads without errors

### Post-Deployment

- [ ] Frontend can reach backend API
- [ ] Signup flow works
- [ ] Magic link email received
- [ ] Login successful
- [ ] CRUD operations work
- [ ] Child accounts can be created
- [ ] Chores can be assigned
- [ ] Data persists after redeploy

---

## Performance & Optimization

### Free Tier Limitations

**Render.com Free Tier:**

- Services spin down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- 750 hours/month per service (enough for 1 service)
- 100 GB bandwidth/month

**Optimization Tips:**

1. Use UptimeRobot or similar to ping /health every 14 minutes
2. Show loading state on frontend during cold start
3. Consider upgrading to paid tier ($7/month) for always-on

### Build Time Optimization

**Current build times:**

- Backend: ~3 minutes
- Frontend: ~5 minutes (due to npm install --force)

**Improvements:**

- Enable build cache in hosting provider
- Use yarn or pnpm if platform supports it natively
- Consider splitting build and deploy steps

---

## Security Best Practices

### Environment Variables

- ✅ Never commit `.env` files
- ✅ Use platform environment variables
- ✅ Rotate Gmail App Password regularly
- ✅ Use different credentials for dev/prod

### Database

- ✅ Use absolute paths for DATABASE_URL
- ✅ Regular backups (manual or automatic)
- ✅ Never run `prisma migrate reset` in production
- ✅ Monitor disk usage

### API Security

- ✅ CORS configured correctly (FRONTEND_URL)
- ✅ HTTPS only (automatic on most platforms)
- ✅ Rate limiting enabled (in backend code)
- ✅ Input validation on all endpoints

---

## Migration Guide

### Switching from Render to Another Provider

1. **Export Data:**

   ```bash
   # Download database.sqlite from persistent disk
   # Via Render Shell or disk snapshot
   ```

2. **Update Environment Variables:**
   - Copy all env vars from Render
   - Update FRONTEND_URL and REACT_APP_API_URL
   - Update DATABASE_URL path if needed

3. **Configure New Provider:**
   - Follow provider-specific setup above
   - Ensure persistent storage is configured
   - Deploy backend first, then frontend

4. **Verify Migration:**
   - Test signup/login flow
   - Verify data exists
   - Check email functionality
   - Test all CRUD operations

### Switching to PostgreSQL

1. **Set Up PostgreSQL Database:**
   - Create database on hosting platform
   - Get connection string

2. **Update Schema:**

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Create Migration:**

   ```bash
   npx prisma migrate dev --name switch_to_postgres
   ```

4. **Update DATABASE_URL:**

   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db
   ```

5. **Migrate Data (if needed):**

   ```bash
   # Export from SQLite
   sqlite3 database.sqlite .dump > data.sql

   # Convert and import to PostgreSQL
   # (requires manual SQL conversion)
   ```

6. **Deploy:**
   - Remove persistent disk requirement
   - Update Pre-Deploy command (use migrate instead of push)

---

## Support & Resources

### Official Documentation

- [Render.com Docs](https://render.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)

### Common Issues

- [Render Troubleshooting](https://render.com/docs/troubleshooting-deploys)
- [Prisma Platform Issues](https://github.com/prisma/prisma/issues)
- [React Router Deployment](https://reactrouter.com/en/main/guides/deployment)

### Monitoring

**Recommended Tools:**

- [UptimeRobot](https://uptimerobot.com/) - Free uptime monitoring
- [Sentry](https://sentry.io/) - Error tracking
- [LogRocket](https://logrocket.com/) - Session replay

---

## Quick Commands Reference

### Local Development

```bash
# Backend
cd backend
npm run dev               # Start dev server
npm test                  # Run tests
npx prisma studio         # Open database GUI

# Frontend
cd frontend
npm start                 # Start dev server
npm test                  # Run tests
npm run build             # Create production build
```

### Production Debugging

```bash
# Check environment variables
printenv | grep DATABASE_URL

# View Prisma version
npx prisma --version

# Check database
sqlite3 /path/to/database.sqlite ".tables"

# Test API endpoint
curl https://backend-url.com/health
```

---

**Last Updated:** October 2, 2025  
**Project Version:** 1.0.0  
**Status:** Production Deployed ✅

**Live URLs:**

- Frontend: https://chores-app-1-lnpp.onrender.com
- Backend: https://chores-app-h1yp.onrender.com
