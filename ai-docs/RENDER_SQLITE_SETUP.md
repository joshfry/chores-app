# 🗄️ Render.com: SQLite + Persistent Disk Setup

Quick reference for deploying Node.js apps with SQLite and Prisma on Render.com.

---

## 🎯 Key Concept: Persistent Disk Overlay Issue

**CRITICAL UNDERSTANDING:**

When Render mounts a persistent disk to a directory (e.g., `/opt/render/project/src/backend/prisma`):

- ✅ The disk provides **persistent storage** that survives deployments
- ❌ The disk **overlays and hides** any files deployed to that directory
- ⚠️ Files like `schema.prisma` won't be accessible even though they're in git

**Solution:** Copy necessary files (schema.prisma) into the mounted disk via SSH after first deployment.

---

## 📋 Deployment Settings

### Build & Deploy Commands

| Setting                | Value                                                 | Notes                                                                |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| **Build Command**      | `npm install && npx prisma generate && npm run build` | Generates Prisma Client during build                                 |
| **Pre-Deploy Command** | _(leave empty)_                                       | Pre-deploy runs **before** disk mount - won't work for db operations |
| **Start Command**      | `npm start`                                           | Simple start after one-time setup                                    |

### Persistent Disk Configuration

| Setting        | Value                                    | Notes                               |
| -------------- | ---------------------------------------- | ----------------------------------- |
| **Name**       | `database-storage`                       | Or any descriptive name             |
| **Mount Path** | `/opt/render/project/src/backend/prisma` | Exactly where your Prisma schema is |
| **Size**       | 1 GB                                     | Free tier limit                     |

---

## 🚀 One-Time Setup Process

### Step 1: Deploy Your Service

Deploy normally through Render dashboard. The first deploy will **fail at runtime** with:

```
Error: The table `main.users` does not exist in the current database
```

This is expected! The database schema hasn't been initialized yet.

### Step 2: Add SSH Key to Render

```bash
# Get your public key
cat ~/.ssh/id_ed25519.pub  # or ~/.ssh/id_rsa.pub

# Copy the output, then:
# 1. Go to https://dashboard.render.com/settings/ssh-keys
# 2. Click "Add SSH Key"
# 3. Paste your public key
```

### Step 3: SSH Into Your Service

```bash
# Find your service ID from the dashboard URL
# Example: https://dashboard.render.com/web/srv-abc123...
ssh srv-YOUR_SERVICE_ID@ssh.oregon.render.com
```

### Step 4: Copy Schema to Persistent Disk

```bash
# Navigate to project root
cd /opt/render/project/src

# Extract and copy schema from git to mounted disk
git show origin/main:backend/prisma/schema.prisma > backend/prisma/schema.prisma

# Verify it was created
ls -la backend/prisma/schema.prisma
```

### Step 5: Initialize Database

```bash
# Navigate to backend directory
cd backend

# Initialize the database schema
npx prisma db push --accept-data-loss

# You should see: "🚀 Your database is now in sync with your Prisma schema"
```

### Step 6: Exit SSH

```bash
exit
```

### Step 7: Test Your App

Visit your app URL - it should now work! The database schema is permanently on the persistent disk.

---

## 🔄 Future Deployments

After the one-time setup:

- ✅ **Database persists** across all deployments
- ✅ **No manual intervention needed**
- ✅ **Schema stays on the mounted disk**

### If You Update the Prisma Schema

When you modify `schema.prisma` in your code:

1. **Commit and push** the updated schema to git
2. **SSH into the service** again
3. **Update the schema on the disk:**
   ```bash
   cd /opt/render/project/src
   git pull  # Get latest changes
   git show origin/main:backend/prisma/schema.prisma > backend/prisma/schema.prisma
   ```
4. **Run migration:**
   ```bash
   cd backend
   npx prisma db push --accept-data-loss
   ```

---

## ⚠️ Common Mistakes

### ❌ Don't: Put `db:push` in Pre-Deploy Command

```yaml
# DON'T DO THIS
preDeployCommand: npm run db:push
```

**Why:** Pre-deploy runs **before** the disk is mounted. The schema file won't be accessible.

### ❌ Don't: Put `db:push` in Build Command

```yaml
# DON'T DO THIS
buildCommand: npm install && npx prisma generate && npm run db:push && npm run build
```

**Why:** Build happens in a temporary directory. The database created won't persist.

### ❌ Don't: Expect Schema Files to Deploy to Mounted Directory

```yaml
# This won't work as expected
mountPath: /opt/render/project/src/backend/prisma
# Any files deployed here are hidden by the disk mount!
```

**Why:** Mounted disks overlay the directory, hiding deployed files.

---

## ✅ Best Practices

### 1. Keep It Simple

After one-time setup, use the simplest commands:

- Build: `npm install && npx prisma generate && npm run build`
- Start: `npm start`

### 2. Document Your Service ID

Save your SSH command for future reference:

```bash
# Add to your project README or .env.local
# SSH_COMMAND=ssh srv-YOUR_SERVICE_ID@ssh.oregon.render.com
```

### 3. Backup Your Database

```bash
# SSH into service
cd /opt/render/project/src/backend/prisma

# Create backup
cp database.sqlite database.backup.sqlite

# Download backup to local machine (from your local terminal)
scp srv-YOUR_SERVICE_ID@ssh.oregon.render.com:/opt/render/project/src/backend/prisma/database.sqlite ./backup-$(date +%Y%m%d).sqlite
```

### 4. Monitor Database Size

```bash
# SSH into service
cd /opt/render/project/src/backend/prisma
ls -lh database.sqlite

# Check disk usage
df -h /opt/render/project/src/backend/prisma
```

---

## 🆚 SQLite vs PostgreSQL on Render

### Use SQLite When:

- ✅ Family/personal apps (low traffic)
- ✅ Simple data models
- ✅ Budget-conscious (free tier)
- ✅ Single-region deployment

### Use PostgreSQL When:

- ✅ Multi-user production apps
- ✅ Need advanced queries/indexing
- ✅ Require automatic backups
- ✅ Need multiple connections
- ✅ Scale is important

---

## 📞 Troubleshooting Quick Reference

| Error                           | Cause                           | Solution                  |
| ------------------------------- | ------------------------------- | ------------------------- |
| "table does not exist"          | Schema not initialized          | Follow Step 4-5 above     |
| "Could not find Prisma Schema"  | Schema not on mounted disk      | Run Step 4 above          |
| "Permission denied (publickey)" | SSH key not added               | Follow Step 2 above       |
| "Pre-deploy has failed"         | Trying to access disk pre-mount | Remove pre-deploy command |

---

## 🔗 Useful Links

- **Render Persistent Disks**: https://render.com/docs/disks
- **Render SSH Access**: https://render.com/docs/ssh
- **Prisma with SQLite**: https://www.prisma.io/docs/concepts/database-connectors/sqlite

---

**Last Updated:** October 2025  
**Status:** Production-tested ✅
