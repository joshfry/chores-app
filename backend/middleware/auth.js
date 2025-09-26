/**
 * Authentication Middleware
 * Protects routes that require user authentication
 */

const authModels = require('../models/auth')

// Mock session storage (in production, use Redis or JWT)
const activeSessions = new Map()

// Create session for user (called after successful magic link verification)
const createSession = (userId) => {
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
const validateSession = (sessionToken) => {
  const session = activeSessions.get(sessionToken)
  if (!session) return null

  // Check if session is expired (24 hours)
  const isExpired = new Date() - session.lastAccess > 24 * 60 * 60 * 1000
  if (isExpired) {
    activeSessions.delete(sessionToken)
    return null
  }

  // Update last access
  session.lastAccess = new Date()
  return session
}

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please provide a valid session token in Authorization header',
    })
  }

  const sessionToken = authHeader.substring(7) // Remove "Bearer "
  const session = validateSession(sessionToken)

  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session',
      message: 'Please log in again',
    })
  }

  // Get user info
  const user = authModels.getUserById(session.userId)
  if (!user || !user.is_active) {
    return res.status(401).json({
      success: false,
      error: 'User not found or inactive',
    })
  }

  // Add user info to request
  req.user = user
  req.session = session

  next()
}

// Middleware to require parent role
const requireParent = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({
      success: false,
      error: 'Parent access required',
      message: 'Only parents can perform this action',
    })
  }
  next()
}

// Middleware to require same family
const requireSameFamily = (req, res, next) => {
  const targetFamilyId = req.params.familyId || req.body.family_id

  if (targetFamilyId && parseInt(targetFamilyId) !== req.user.family_id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      message: "You can only access your own family's data",
    })
  }
  next()
}

// Get current user info (protected endpoint)
const getCurrentUser = (req, res) => {
  const family = authModels.getFamilyById(req.user.family_id)

  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        family_id: req.user.family_id,
        total_points: req.user.total_points,
        last_login: req.user.last_login,
      },
      family: family
        ? {
            id: family.id,
            name: family.name,
          }
        : null,
    },
  })
}

module.exports = {
  createSession,
  validateSession,
  requireAuth,
  requireParent,
  requireSameFamily,
  getCurrentUser,
}
