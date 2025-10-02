# Email Setup Guide

This guide will help you configure real email sending for magic links in the Family Chores app.

## 📧 Quick Start

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to your `.env` file**:

   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM_NAME=Family Chores
   EMAIL_FROM=your-email@gmail.com
   FRONTEND_URL=http://localhost:3000
   ```

4. **Restart your backend server**

That's it! Magic links will now be sent via email.

---

## 🚀 Production Email Services

### Option 2: SendGrid (Recommended for Production)

**Why SendGrid?** Professional email service with high deliverability, free tier includes 100 emails/day.

1. **Sign up**: https://sendgrid.com/
2. **Create an API Key**: Settings > API Keys > Create API Key
3. **Verify a sender**: Settings > Sender Authentication
4. **Add to `.env`**:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   EMAIL_FROM_NAME=Family Chores
   EMAIL_FROM=your-verified-sender@yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

### Option 3: Mailgun

**Why Mailgun?** Powerful email API with excellent analytics, free tier includes 5,000 emails/month.

1. **Sign up**: https://www.mailgun.com/
2. **Get SMTP credentials**: Sending > Domain Settings > SMTP Credentials
3. **Add to `.env`**:
   ```env
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-mailgun-smtp-username
   EMAIL_PASS=your-mailgun-smtp-password
   EMAIL_FROM_NAME=Family Chores
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

### Option 4: Amazon SES

**Why SES?** Extremely cheap ($0.10 per 1,000 emails), highly reliable.

1. **Set up SES**: https://aws.amazon.com/ses/
2. **Get SMTP credentials**: Amazon SES > SMTP Settings
3. **Add to `.env`**:
   ```env
   EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-ses-smtp-username
   EMAIL_PASS=your-ses-smtp-password
   EMAIL_FROM_NAME=Family Chores
   EMAIL_FROM=verified-email@yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

### Option 5: Custom SMTP

Use any SMTP provider:

```env
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-username
EMAIL_PASS=your-password
EMAIL_FROM_NAME=Family Chores
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

---

## 🔧 Environment Variables Reference

| Variable          | Required | Description                 | Example                  |
| ----------------- | -------- | --------------------------- | ------------------------ |
| `EMAIL_SERVICE`   | No       | Pre-configured service name | `gmail`, `outlook`       |
| `EMAIL_HOST`      | No\*     | SMTP server hostname        | `smtp.gmail.com`         |
| `EMAIL_PORT`      | No\*     | SMTP server port            | `587`, `465`, `25`       |
| `EMAIL_SECURE`    | No       | Use TLS (true for port 465) | `true`, `false`          |
| `EMAIL_USER`      | **Yes**  | SMTP username/email         | `your-email@gmail.com`   |
| `EMAIL_PASS`      | **Yes**  | SMTP password/API key       | `your-app-password`      |
| `EMAIL_FROM_NAME` | No       | Sender display name         | `Family Chores`          |
| `EMAIL_FROM`      | No       | Sender email address        | `noreply@yourdomain.com` |
| `FRONTEND_URL`    | **Yes**  | Frontend app URL            | `http://localhost:3000`  |

\* Required if not using `EMAIL_SERVICE`

---

## 🧪 Testing Email Configuration

### Test via API

```bash
# 1. Request a magic link
curl -X POST http://localhost:3001/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com"}'

# 2. Check your email inbox for the magic link
# 3. Click the link to verify it works
```

### Test via Frontend

1. Go to `http://localhost:3000/login`
2. Enter your email
3. Check your inbox for the magic link email
4. Click the link to sign in

---

## 🐛 Troubleshooting

### Issue: "Email not configured"

**Solution**: Make sure `EMAIL_USER` and `EMAIL_PASS` are set in your `.env` file.

### Issue: "Authentication failed" (Gmail)

**Possible causes**:

1. Not using an App Password (use App Password, not your regular Gmail password)
2. 2FA not enabled on your Gmail account
3. "Less secure app access" is disabled (deprecated by Google, use App Passwords instead)

**Solution**: Follow the Gmail setup steps above carefully.

### Issue: Emails going to spam

**Solutions**:

1. **Use a verified sender** (especially important for SendGrid, Mailgun, SES)
2. **Set up SPF/DKIM records** for your domain
3. **Use a professional email service** (SendGrid, Mailgun, SES) instead of Gmail for production

### Issue: "Connection timeout"

**Possible causes**:

1. Incorrect `EMAIL_HOST` or `EMAIL_PORT`
2. Firewall blocking SMTP connections
3. Your hosting provider blocks outbound SMTP

**Solutions**:

1. Verify your SMTP credentials
2. Try port `587` (recommended) or `465` (with `EMAIL_SECURE=true`)
3. Check with your hosting provider about SMTP restrictions

---

## 📝 Development vs Production

### Development

- **Gmail**: Quick setup, good for testing
- **Console logging**: If email not configured, links are logged to console
- **Short expiry**: 1 hour for magic links

### Production

- **SendGrid/Mailgun/SES**: Professional services with high deliverability
- **Domain verification**: Set up SPF, DKIM, DMARC records
- **Monitoring**: Track email delivery, bounces, and opens
- **Error handling**: Emails that fail to send fall back to console logging

---

## 🎨 Email Templates

The app includes two beautiful HTML email templates:

### 1. Magic Link Email (Login/Signup)

- Gradient header with logo
- Clear CTA button
- Fallback text link
- Security notice
- Mobile-responsive design

### 2. Child Invitation Email

- Welcome message with parent's name
- Different styling to distinguish from login emails
- 24-hour expiry (longer than standard login links)
- Kid-friendly design

Both templates are fully customizable in `/backend/lib/email.ts`.

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use App Passwords** for Gmail (never your main password)
3. **Use API keys** for production services (SendGrid, Mailgun, SES)
4. **Verify sender domains** to prevent spoofing
5. **Rotate credentials** regularly
6. **Monitor email logs** for suspicious activity
7. **Use environment variables** for all sensitive data

---

## 💡 Tips

- **Gmail daily limit**: 500 emails/day for free accounts, 2,000 for Google Workspace
- **SendGrid free tier**: 100 emails/day forever
- **Mailgun free tier**: 5,000 emails/month for 3 months
- **SES pricing**: $0.10 per 1,000 emails (cheapest at scale)
- **Test thoroughly** before going to production
- **Monitor bounce rates** to maintain good sender reputation

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Setup](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Mailgun SMTP Setup](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)
- [Amazon SES SMTP Setup](https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html)

---

**Need help?** Check the backend console logs for detailed error messages when emails fail to send.
