/**
 * Email Service
 * Handles sending emails via Nodemailer with support for multiple providers
 */

import nodemailer, { Transporter } from 'nodemailer'
import { emailConfig, isEmailConfigured } from '../config/email'

// Email transporter (configured once)
let transporter: Transporter | null = null

/**
 * Initialize email transporter
 */
const getTransporter = (): Transporter | null => {
  if (!isEmailConfigured()) {
    console.warn('⚠️  Email not configured. Using console logging instead.')
    return null
  }

  if (!transporter) {
    try {
      transporter = nodemailer.createTransport({
        service: emailConfig.service,
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth,
      })

      console.log('✅ Email transporter initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error)
      return null
    }
  }

  return transporter
}

/**
 * Send magic link email
 */
export const sendMagicLinkEmail = async (
  email: string,
  token: string,
  userName?: string,
): Promise<boolean> => {
  const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${token}`

  // In development, always mock emails (log to console)
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📧 ========================================')
    console.log(`📧 Mock Email sent to ${email}`)
    console.log(`👤 User: ${userName || 'Unknown'}`)
    console.log(`🔗 Magic Link: ${magicLink}`)
    console.log('📧 ========================================\n')
    return true
  }

  // In production, use real email
  const emailTransporter = getTransporter()

  // If email not configured in production, fall back to console logging
  if (!emailTransporter) {
    console.log('\n📧 ========================================')
    console.log(`📧 Mock Email sent to ${email}`)
    console.log(`👤 User: ${userName || 'Unknown'}`)
    console.log(`🔗 Magic Link: ${magicLink}`)
    console.log('📧 ========================================\n')
    return true
  }

  // Email template
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Magic Link - Family Chores</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🏠 Family Chores</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your magic link is ready!</p>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hi${userName ? ` ${userName}` : ''}! 👋
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Click the button below to sign in to your Family Chores account. This link will expire in <strong>1 hour</strong>.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${magicLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                🔐 Sign In to Family Chores
              </a>
            </div>

            <!-- Alternative Link -->
            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 10px 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; color: #3b82f6; font-size: 14px; margin: 0;">
                ${magicLink}
              </p>
            </div>

            <!-- Security Notice -->
            <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                <strong>🔒 Security Note:</strong> This link can only be used once and will expire in 1 hour. If you didn't request this link, you can safely ignore this email.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding: 20px;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              © ${new Date().getFullYear()} Family Chores. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  const emailText = `
Hi${userName ? ` ${userName}` : ''}!

Click the link below to sign in to your Family Chores account:

${magicLink}

This link will expire in 1 hour and can only be used once.

If you didn't request this link, you can safely ignore this email.

---
© ${new Date().getFullYear()} Family Chores
  `.trim()

  try {
    const info = await emailTransporter.sendMail({
      from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
      to: email,
      subject: '🔐 Your Magic Link - Family Chores',
      text: emailText,
      html: emailHtml,
    })

    console.log('✅ Email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Failed to send email:', error)

    // Fallback to console logging
    console.log('\n📧 ========================================')
    console.log(`📧 Email delivery failed. Here's your magic link:`)
    console.log(`🔗 ${magicLink}`)
    console.log('📧 ========================================\n')

    return false
  }
}

/**
 * Send child account invitation email
 */
export const sendChildInvitationEmail = async (
  email: string,
  token: string,
  childName: string,
  parentName: string,
): Promise<boolean> => {
  const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${token}`

  // In development, always mock emails (log to console)
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📧 ========================================')
    console.log(`📧 Child Invitation Email (Mock)`)
    console.log(`👤 Child: ${childName}`)
    console.log(`👨‍👩‍👧 Parent: ${parentName}`)
    console.log(`📮 Email: ${email}`)
    console.log(`🔗 Magic Link: ${magicLink}`)
    console.log('📧 ========================================\n')
    return true
  }

  // In production, use real email
  const emailTransporter = getTransporter()

  if (!emailTransporter) {
    console.log('\n📧 ========================================')
    console.log(`📧 Child Invitation Email (Mock)`)
    console.log(`👤 Child: ${childName}`)
    console.log(`👨‍👩‍👧 Parent: ${parentName}`)
    console.log(`📮 Email: ${email}`)
    console.log(`🔗 Magic Link: ${magicLink}`)
    console.log('📧 ========================================\n')
    return true
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Family Chores!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎉 Welcome to Family Chores!</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">You've been added to your family's account</p>
          </div>

          <!-- Content -->
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hi ${childName}! 👋
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              ${parentName} has created a Family Chores account for you! Click the button below to activate your account and see your chores.
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              This link will expire in <strong>24 hours</strong>.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${magicLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                ✨ Activate My Account
              </a>
            </div>

            <!-- Alternative Link -->
            <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 10px 0;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; color: #10b981; font-size: 14px; margin: 0;">
                ${magicLink}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding: 20px;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              © ${new Date().getFullYear()} Family Chores. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  const emailText = `
Hi ${childName}!

${parentName} has created a Family Chores account for you! Click the link below to activate your account:

${magicLink}

This link will expire in 24 hours.

---
© ${new Date().getFullYear()} Family Chores
  `.trim()

  try {
    const info = await emailTransporter.sendMail({
      from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
      to: email,
      subject: '🎉 Welcome to Family Chores!',
      text: emailText,
      html: emailHtml,
    })

    console.log('✅ Child invitation email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Failed to send child invitation email:', error)
    return false
  }
}
