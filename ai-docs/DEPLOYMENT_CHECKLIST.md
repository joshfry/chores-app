# 🚀 Quick Deployment Checklist

Use this checklist to deploy to Render.com step-by-step.

## ✅ Pre-Deployment

- [ ] Code is committed to git
- [ ] Tests are passing
- [ ] `.env` is in `.gitignore` (already done ✅)
- [ ] Gmail App Password ready: `kpzw bxzx xhrg ihgz`
- [ ] Gmail Email ready: `joshua.d.fry@gmail.com`

## 📝 Step 1: GitHub

```bash
# Create repo on GitHub first: https://github.com/new
# Then run:

cd /Users/jofry/Desktop/chores
git remote add origin https://github.com/YOUR_USERNAME/family-chores.git
git push -u origin main
```

- [ ] Repo created on GitHub
- [ ] Code pushed successfully

## 🌐 Step 2: Render.com Setup

1. [ ] Go to https://dashboard.render.com
2. [ ] Click **"New +"** → **"Web Service"**
3. [ ] Connect your GitHub repository

## ⚙️ Step 3: Backend Configuration

**Service Name**: `family-chores-backend`

**Build & Deploy**:

- Root Directory: `backend`
- Environment: Node
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npm start`

**Environment Variables** (click "Advanced" → "Add Environment Variable"):

```
NODE_ENV=production
PORT=3001
DATABASE_URL=file:./prisma/database.sqlite
EMAIL_SERVICE=gmail
EMAIL_USER=joshua.d.fry@gmail.com
EMAIL_PASS=kpzw bxzx xhrg ihgz
EMAIL_FROM_NAME=Family Chores
EMAIL_FROM=joshua.d.fry@gmail.com
```

**⚠️ IMPORTANT - Add Disk for Database Persistence**:

1. [ ] After service is created, go to "Disks" tab
2. [ ] Click "Add Disk"
3. [ ] Name: `database-storage`
4. [ ] Mount Path: `/opt/render/project/src/backend/prisma`
5. [ ] Size: 1GB
6. [ ] Save

- [ ] Backend deployed successfully
- [ ] Disk added (CRITICAL!)
- [ ] Copy backend URL: `https://_____.onrender.com`

## 🎨 Step 4: Frontend Configuration

1. [ ] Click **"New +"** → **"Static Site"**
2. [ ] Select same GitHub repository

**Service Name**: `family-chores-frontend`

**Build & Deploy**:

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`

**Environment Variables**:

```
REACT_APP_API_URL=https://YOUR-BACKEND-URL.onrender.com
```

(Replace with actual backend URL from Step 3)

**Redirects/Rewrites** (for React Router):

- Click "Redirects/Rewrites"
- Add rule:
  - Source: `/*`
  - Destination: `/index.html`
  - Action: Rewrite

- [ ] Frontend deployed successfully
- [ ] Backend URL added to environment variables
- [ ] Redirects configured
- [ ] Copy frontend URL: `https://_____.onrender.com`

## 🔄 Step 5: Update Backend with Frontend URL

1. [ ] Go back to backend service
2. [ ] Click "Environment"
3. [ ] Update `FRONTEND_URL` to your actual frontend URL
4. [ ] Save (will trigger redeploy)

## 🧪 Step 6: Test the Deployment

1. [ ] Visit frontend URL
2. [ ] Click "Sign Up"
3. [ ] Enter email and create account
4. [ ] Check `joshua.d.fry@gmail.com` for magic link email
5. [ ] Click magic link to verify
6. [ ] Create a child user
7. [ ] Assign chores
8. [ ] Test complete workflow

## 🎉 Success!

Your app is now live at:

- **Frontend**: https://_____.onrender.com
- **Backend**: https://_____.onrender.com

---

## 🐛 Common Issues

### "Cannot connect to database"

→ Make sure you added the persistent disk!

### "CORS error"

→ Make sure `FRONTEND_URL` in backend matches your actual frontend URL (including https://)

### "Network Error" in frontend

→ Make sure `REACT_APP_API_URL` in frontend matches your backend URL

### App is slow on first load

→ Normal! Free tier spins down after 15 min. First request takes ~30 seconds.

### Email not sending

→ Check email credentials are correct in backend environment variables

---

## 💡 Next Steps

- [ ] Share frontend URL with family
- [ ] Set up custom domain (optional)
- [ ] Monitor logs for errors
- [ ] Celebrate! 🎉

**Total time: ~15 minutes** ⏱️
