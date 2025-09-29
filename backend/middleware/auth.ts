/**
 * Authentication Middleware
 * Protects routes that require user authentication
 */

import { Request, Response, NextFunction } from 'express'
import * as authModels from '../models/auth.js'
import { User } from '../models/auth.js'

// Session interface
interface Session {
  userId: number
  createdAt: Date
  lastAccess: Date
}

// Extend Express Request to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: User
      session?: Session
    }
  }
}

// Mock session storage (in production, use Redis or JWT)
const activeSessions = new Map<string, Session>()

// Create session for user (called after successful magic link verification)
export const createSession = (userId: number): string => {
  const sessionToken = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`
  activeSessions.set(sessionToken, {
    userId,
    createdAt: new Date(),
    lastAccess: new Date(),
  })
  return sessionToken
}

// Validate session token
export const validateSession = (sessionToken: string): Session | null => {
  const session = activeSessions.get(sessionToken)
  if (!session) return null

  // Check if session is expired (24 hours)
  const now = new Date()
  const sessionAge = now.getTime() - session.lastAccess.getTime()
  const MAX_SESSION_AGE = 24 * 60 * 60 * 1000 // 24 hours

  if (sessionAge > MAX_SESSION_AGE) {
    activeSessions.delete(sessionToken)
    return null
  }

  // Update last access
  session.lastAccess = new Date()
  return session
}

// Middleware to require authentication
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please provide a valid session token in Authorization header',
    })
    return
  }

  const sessionToken = authHeader.substring(7) // Remove "Bearer "
  const session = validateSession(sessionToken)

  if (!session) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session',
      message: 'Please log in again',
    })
    return
  }

  // Get user info
  const user = authModels.getUserById(session.userId)
  if (!user || !user.is_active) {
    res.status(401).json({
      success: false,
      error: 'User not found or inactive',
    })
    return
  }

  // Add user info to request
  req.user = user
  req.session = session

  next()
}

// Middleware to require parent role
export const requireParent = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    })
    return
  }

  if (req.user.role !== 'parent') {
    res.status(403).json({
      success: false,
      error: 'Parent role required',
      message: 'Only parents can perform this action',
    })
    return
  }

  next()
}

// Middleware to ensure users can only access their own family data
export const requireSameFamily = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    })
    return
  }

  // Check if route has family-related parameter
  const targetFamilyId = req.params.familyId || req.body.family_id

  if (!targetFamilyId) {
    // No family constraint, allow access
    next()
    return
  }

  if (parseInt(targetFamilyId) !== req.user.family_id) {
    res.status(403).json({
      success: false,
      error: 'Access denied',
      message: 'You can only access data from your own family',
    })
    return
  }

  next()
}

// Helper to get current authenticated user info
export const getCurrentUser = (req: Request): User | null => {
  if (!req.user) return null

  const family = authModels.getFamilyById(req.user.family_id)
  return {
    ...req.user,
    family: family || undefined,
  } as User & { family?: any }
}
