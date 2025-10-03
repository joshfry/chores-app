# 🚀 Deployment Guide - Render.com

Complete guide to deploying the Family Chores app to Render.com (free tier available).

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Render.com account (free: https://render.com)
- [x] Gmail App Password (for email functionality)

---

## Part 1: Push to GitHub

### Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. **Repository name**: `family-chores` (or your choice)
3. **Visibility**: Private or Public (your choice)
4. **DON'T** initialize with README (you already have one)
5. Click **"Create repository"**

### Step 2: Push Your Code

```bash
cd /Users/jofry/Desktop/chores

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/family-chores.git

# Push to GitHub
git push -u origin main
```

✅ Your code is now on GitHub!

---

## Part 2: Deploy to Render.com

### Option A: Automatic Deployment (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New +"** → **"Blueprint"**

3. **Connect GitHub Repository**
   - Click "Connect GitHub"
   - Authorize Render
   - Select your `family-chores` repository

4. **Render will detect `render.yaml`** and show:
   - ✅ family-chores-backend (Web Service)
   - ✅ family-chores-frontend (Static Site)
   - ✅ family-chores-db (PostgreSQL Database)

5. **Click "Apply"**

6. **Wait for deployment** (5-10 minutes first time)

---

### Option B: Manual Deployment (Alternative)

If you prefer manual setup or the Blueprint doesn't work:

#### 1. Deploy Backend

1. **New Web Service**
   - **Name**: `family-chores-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Pre-Deploy Command**: _(leave empty)_
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter

2. **Add Environment Variables**:

   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=file:./prisma/database.sqlite
   FRONTEND_URL=https://your-frontend-url.onrender.com
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM_NAME=Family Chores
   EMAIL_FROM=your-email@gmail.com
   ```

3. **Add Disk** (Critical for SQLite persistence):
   - Go to "Disks" tab
   - Click "Add Disk"
   - **Name**: `database-storage`
   - **Mount Path**: `/opt/render/project/src/backend/prisma`
   - **Size**: 1GB (free tier)
   - Save

4. **⚠️ IMPORTANT: One-Time Database Setup** (see Part 5 below)

#### 2. Deploy Frontend

1. **New Static Site**
   - **Name**: `family-chores-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Free

2. **Add Environment Variables**:

   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

3. **Add Rewrites** (for React Router):
   - Source: `/*`
   - Destination: `/index.html`

---

## Part 3: Configure Environment Variables

### Backend Environment Variables

| Variable          | Value                                | Notes                   |
| ----------------- | ------------------------------------ | ----------------------- |
| `NODE_ENV`        | `production`                         | Required                |
| `PORT`            | `3001`                               | Or use Render's default |
| `DATABASE_URL`    | `file:./prisma/database.sqlite`      | For SQLite              |
| `FRONTEND_URL`    | `https://your-frontend.onrender.com` | Your frontend URL       |
| `EMAIL_SERVICE`   | `gmail`                              | Or your provider        |
| `EMAIL_USER`      | `your-email@gmail.com`               | Your email              |
| `EMAIL_PASS`      | `your-app-password`                  | Gmail App Password      |
| `EMAIL_FROM_NAME` | `Family Chores`                      | Sender name             |
| `EMAIL_FROM`      | `your-email@gmail.com`               | Sender email            |

### Frontend Environment Variables

| Variable            | Value                               | Notes            |
| ------------------- | ----------------------------------- | ---------------- |
| `REACT_APP_API_URL` | `https://your-backend.onrender.com` | Your backend URL |

---

## Part 4: Update Frontend API URL

After deployment, update your frontend to use the production API:

1. In Render Dashboard, copy your **backend URL** (e.g., `https://family-chores-backend.onrender.com`)

2. Add it to frontend environment variables:

   ```
   REACT_APP_API_URL=https://family-chores-backend.onrender.com
   ```

3. Redeploy frontend (or wait for auto-deploy)

---

## Part 5: First-Time Setup

### 🚨 CRITICAL: Initialize Database Schema (One-Time Only)

**⚠️ This step is REQUIRED for SQLite + Persistent Disk setups!**

When Render mounts a persistent disk, it **overlays** the directory and hides any files deployed there. The `schema.prisma` file won't be accessible until we copy it to the mounted disk.

**Steps:**

1. **Add your SSH key to Render** (if not already done):
   - Go to: https://dashboard.render.com/settings/ssh-keys
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub` or `cat ~/.ssh/id_rsa.pub`
   - Click "Add SSH Key" and paste it

2. **SSH into your backend service**:

   ```bash
   # Replace SERVICE_ID with your actual service ID from the dashboard URL
   ssh SERVICE_ID@ssh.oregon.render.com
   ```

3. **Copy the Prisma schema to the persistent disk**:

   ```bash
   cd /opt/render/project/src
   git show origin/main:backend/prisma/schema.prisma > backend/prisma/schema.prisma
   ```

4. **Initialize the database**:

   ```bash
   cd backend
   npx prisma db push --accept-data-loss
   ```

   You should see: `🚀 Your database is now in sync with your Prisma schema`

5. **Exit SSH**:
   ```bash
   exit
   ```

**✅ Done!** The database schema is now permanently on the persistent disk and will survive all future deployments.

---

### Test the App

1. Visit your frontend URL: `https://your-frontend.onrender.com`
2. Click "Sign Up"
3. Create a family account
4. Check your email for magic link
5. Sign in and test features!

---

## 🔧 Troubleshooting

### Issue: "The table `main.users` does not exist in the current database"

**Cause**: Database schema not initialized on the persistent disk.

**Solution**: Follow the **Part 5: Initialize Database Schema** steps above. This is a **one-time setup** required for SQLite + persistent disk.

---

### Issue: "Could not find Prisma Schema that is required for this command"

**Cause**: When Render mounts a persistent disk at `/opt/render/project/src/backend/prisma`, it overlays and hides the deployed `schema.prisma` file.

**Solution**:

```bash
# SSH into your service and copy the schema from git
cd /opt/render/project/src
git show origin/main:backend/prisma/schema.prisma > backend/prisma/schema.prisma
```

---

### Issue: "Cannot connect to database"

**Solution**: Make sure you added the persistent disk for SQLite:

- Backend service → Disks → Add Disk
- Mount path: `/opt/render/project/src/backend/prisma`
- Size: 1GB

---

### Issue: "Permission denied (publickey)" when SSH'ing

**Solution**: Add your SSH public key to Render:

1. Get your key: `cat ~/.ssh/id_ed25519.pub` or `cat ~/.ssh/id_rsa.pub`
2. Go to: https://dashboard.render.com/settings/ssh-keys
3. Click "Add SSH Key" and paste it
4. Wait 30 seconds, then try SSH again

---

### Issue: "CORS errors" in browser

**Solution**: Add `FRONTEND_URL` environment variable to backend with your exact frontend URL (no trailing slash).

---

### Issue: "Magic links not working"

**Possible causes**:

1. `FRONTEND_URL` incorrect in backend environment variables
2. Email credentials incorrect
3. Gmail App Password expired

**Solution**: Check environment variables and test email locally first.

---

### Issue: Frontend shows "Network Error"

**Solution**: Update `REACT_APP_API_URL` in frontend environment variables with your backend URL.

---

### Issue: Free tier service sleeps after inactivity

**Reality**: Render's free tier spins down after 15 minutes of inactivity.

- First request after sleep takes ~30 seconds
- Consider upgrading to paid tier ($7/month) for always-on service

---

### Issue: Database resets on deploy

**Solution**:

1. Make sure disk is attached properly
2. Don't run `prisma migrate reset` in production
3. Database file persists on the mounted disk across deployments

---

### Issue: Pre-Deploy command fails with schema not found

**Why this happens**: The Pre-Deploy command runs **before** the persistent disk is mounted, so it can't access the database or schema files.

**Solution**:

- Leave Pre-Deploy Command **empty**
- Database initialization should be done via SSH (one-time) or in the Start Command (if needed)

---

## 💡 Tips for Production

### 1. Use PostgreSQL Instead of SQLite

For better performance and reliability:

1. In Render Dashboard → New → PostgreSQL
2. Copy the connection string
3. Update `DATABASE_URL` in backend environment variables
4. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Redeploy backend

### 2. Set Up Custom Domain

1. Render Dashboard → Static Site → Custom Domain
2. Add your domain (e.g., `chores.yourdomain.com`)
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in backend to use custom domain

### 3. Monitor Your App

- Render Dashboard → Logs (check for errors)
- Render Dashboard → Metrics (check performance)
- Set up health check alerts

### 4. Backup Your Database

If using SQLite with disk:

1. Render Dashboard → Shell
2. Run: `cp prisma/database.sqlite prisma/database.backup.sqlite`

If using PostgreSQL:

- Render automatically backs up daily on paid plans

---

## 🔐 Security Checklist

- [ ] Environment variables are set (not hardcoded)
- [ ] `.env` files are in `.gitignore` ✅
- [ ] Database files are in `.gitignore` ✅
- [ ] Using Gmail App Password (not main password) ✅
- [ ] CORS configured for production URLs
- [ ] HTTPS enabled (automatic on Render) ✅

---

## 📊 Free Tier Limits (Render.com)

- **Web Services**: 750 hours/month (enough for 1 service)
- **Static Sites**: Unlimited
- **PostgreSQL**: 90 days free, then $7/month
- **Bandwidth**: 100 GB/month
- **Build minutes**: 500 minutes/month

**Perfect for family use!** 🎉

---

## 🚀 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render.com account created
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Database configured (SQLite + disk OR PostgreSQL)
- [ ] Environment variables set
- [ ] Email credentials configured
- [ ] CORS/URLs updated
- [ ] First signup tested
- [ ] Magic link email received
- [ ] App fully functional

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Check logs**: Render Dashboard → Your Service → Logs

---

**Congratulations!** 🎉 Your Family Chores app is now live in production!

Share the URL with your family and start managing chores together! 👨‍👩‍👧‍👦
