/**
 * Email Configuration
 * Supports multiple email providers (Gmail, SendGrid, Mailgun, etc.)
 */

export interface EmailConfig {
  service?: string // e.g., 'gmail', 'outlook'
  host?: string // SMTP host
  port?: number // SMTP port
  secure?: boolean // Use TLS
  auth: {
    user: string // Email address
    pass: string // Password or API key
  }
  from: {
    name: string // Sender name
    email: string // Sender email
  }
}

export const emailConfig: EmailConfig = {
  // Option 1: Use a service (Gmail, Outlook, etc.)
  service: process.env.EMAIL_SERVICE || undefined,

  // Option 2: Use custom SMTP settings
  host: process.env.EMAIL_HOST || undefined,
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : undefined,
  secure: process.env.EMAIL_SECURE === 'true',

  // Authentication
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },

  // From address
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Family Chores',
    email: process.env.EMAIL_FROM || process.env.EMAIL_USER || '',
  },
}

// Check if email is configured
export const isEmailConfigured = (): boolean => {
  return !!(emailConfig.auth.user && emailConfig.auth.pass)
}
