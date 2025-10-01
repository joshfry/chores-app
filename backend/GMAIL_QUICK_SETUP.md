# 📧 Gmail Quick Setup (5 Minutes)

## Step 1: Enable 2-Factor Authentication

1. Go to: https://myaccount.google.com/security
2. Click **2-Step Verification**
3. Follow the prompts to enable it

## Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. In the "Select app" dropdown, choose **Mail**
3. In the "Select device" dropdown, choose **Other (Custom name)**
4. Type: `Family Chores App`
5. Click **Generate**
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

## Step 3: Create `.env` File

Create a file at `/backend/.env` with this content:

```env
# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="file:./prisma/database.sqlite"

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM_NAME=Family Chores
EMAIL_FROM=your-email@gmail.com
```

**Replace**:

- `your-email@gmail.com` with your actual Gmail address
- `abcd efgh ijkl mnop` with your App Password from Step 2

## Step 4: Restart Backend

```bash
cd backend
npm run dev
```

## Step 5: Test It!

### Option A: Via Frontend

1. Go to http://localhost:3000/login
2. Enter your email
3. Check your Gmail inbox
4. Click the magic link

### Option B: Via Terminal

```bash
curl -X POST http://localhost:3001/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@gmail.com"}'
```

Then check your Gmail inbox!

---

## 🎉 That's It!

You should now receive **beautiful HTML emails** with magic links instead of console logs.

## 🐛 Troubleshooting

**Problem**: Still seeing console logs instead of emails

- **Check**: Is your `.env` file in `/backend/.env`?
- **Check**: Did you restart the backend after creating `.env`?
- **Check**: Are `EMAIL_USER` and `EMAIL_PASS` correct?

**Problem**: "Invalid credentials" error

- **Check**: Did you use an **App Password** (not your regular Gmail password)?
- **Check**: Is 2-Factor Authentication enabled?

**Problem**: Emails going to spam

- **Solution**: Mark the first email as "Not Spam" in Gmail
- **Why**: Gmail learns from this and future emails will go to inbox

---

## 📖 For More Options

See `EMAIL_SETUP.md` for:

- SendGrid setup (production-ready)
- Mailgun setup (5,000 free emails/month)
- Amazon SES setup (cheapest at scale)
- Custom SMTP configuration
