/**
 * Authentication Routes
 * Handles passwordless authentication, user management, and family setup
 */

import express, { Request, Response } from 'express'
import * as authModels from '../models/auth.js'
import {
  createSession,
  requireAuth,
  requireParent,
  getCurrentUser,
} from '../middleware/auth.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock email service (replace with real nodemailer setup later)
const sendMagicLink = async (
  email: string,
  token: string,
): Promise<boolean> => {
  console.log(`📧 Mock Email sent to ${email}`)
  console.log(`🔗 Magic Link: http://localhost:3000/auth/verify?token=${token}`)
  return true
}

// POST /auth/signup - Parent creates family account
router.post('/signup', (req: Request, res: Response) => {
  try {
    const { email, name, familyName, birthdate } = req.body

    // Validation
    if (!email || !name || !familyName) {
      return res.status(400).json({
        success: false,
        error: 'Email, name, and family name are required',
      })
    }

    // Check if user already exists
    const existingUser = authModels.getUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      })
    }

    // Create family first
    const family = authModels.createFamily({
      name: familyName,
      created_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      primary_parent_id: 0, // Will be updated below
    })

    // Create parent user
    const user = authModels.createUser({
      email,
      role: 'parent',
      family_id: family.id,
      name,
      birthdate: birthdate || new Date().toISOString().split('T')[0],
      total_points: null,
      created_by: null,
      last_login: new Date().toISOString(),
      is_active: true,
    })

    // Create magic token
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry
    const magicToken = `magic_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    authModels.createMagicToken(user.id, magicToken, expiresAt.toISOString())

    // Send magic link (mock for now)
    sendMagicLink(email, magicToken)

    res.status(201).json({
      success: true,
      message: 'Family account created! Check your email for login link.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        family: {
          id: family.id,
          name: family.name,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: (error as Error).message,
    })
  }
})

// POST /auth/send-magic-link - Send magic link to existing user
router.post('/send-magic-link', (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      })
    }

    const user = authModels.getUserByEmail(email)
    if (!user || !user.is_active) {
      return res.status(404).json({
        success: false,
        error: 'User not found or inactive',
      })
    }

    // Create magic token
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry
    const magicToken = `magic_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    authModels.createMagicToken(user.id, magicToken, expiresAt.toISOString())

    // Send magic link (mock for now)
    sendMagicLink(email, magicToken)

    res.json({
      success: true,
      message: 'Magic link sent to your email!',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: (error as Error).message,
    })
  }
})

// GET /auth/verify - Verify magic link and create session
router.get('/verify', (req: Request, res: Response) => {
  try {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      })
    }

    const magicToken = authModels.getMagicToken(token)
    if (!magicToken) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
      })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(magicToken.expires_at)
    if (now > expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'Token has expired',
      })
    }

    // Get user
    const user = authModels.getUserById(magicToken.user_id)
    if (!user || !user.is_active) {
      return res.status(404).json({
        success: false,
        error: 'User not found or inactive',
      })
    }

    // Mark token as used
    authModels.markTokenAsUsed(token)

    // Update last login
    authModels.updateUser(user.id, {
      last_login: new Date().toISOString(),
    })

    // Create session
    const sessionToken = createSession(user.id)

    // Get family info
    const family = authModels.getFamilyById(user.family_id)

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          family_id: user.family_id,
        },
        family: family
          ? {
              id: family.id,
              name: family.name,
            }
          : null,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: (error as Error).message,
    })
  }
})

// GET /auth/me - Get current user info
router.get('/me', requireAuth, (req: Request, res: Response) => {
  try {
    const user = getCurrentUser(req)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    const family = authModels.getFamilyById(user.family_id)

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          family_id: user.family_id,
          birthdate: user.birthdate,
          total_points: user.total_points,
          last_login: user.last_login,
        },
        family: family
          ? {
              id: family.id,
              name: family.name,
              created_date: family.created_date,
            }
          : null,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: (error as Error).message,
    })
  }
})

// POST /auth/create-child - Parent creates child account
router.post(
  '/create-child',
  requireAuth,
  requireParent,
  (req: Request, res: Response) => {
    try {
      const { email, name, birthdate } = req.body

      if (!email || !name || !birthdate) {
        return res.status(400).json({
          success: false,
          error: 'Email, name, and birthdate are required',
        })
      }

      // Check if user already exists
      const existingUser = authModels.getUserByEmail(email)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists',
        })
      }

      // Create child user
      const child = authModels.createUser({
        email,
        role: 'child',
        family_id: req.user!.family_id,
        name,
        birthdate,
        total_points: 0,
        created_by: req.user!.id,
        last_login: new Date().toISOString(),
        is_active: true,
      })

      // Create magic token for child
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry for child setup
      const magicToken = `magic_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`

      authModels.createMagicToken(child.id, magicToken, expiresAt.toISOString())

      // Send magic link (mock for now)
      sendMagicLink(email, magicToken)

      res.status(201).json({
        success: true,
        message: 'Child account created! Magic link sent to child email.',
        data: {
          child: {
            id: child.id,
            email: child.email,
            name: child.name,
            role: child.role,
            birthdate: child.birthdate,
          },
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: (error as Error).message,
      })
    }
  },
)

// GET /auth/users - List all users in family
router.get('/users', requireAuth, (req: Request, res: Response) => {
  try {
    const allUsers = authModels.getAllUsers()
    const familyUsers = allUsers.filter(
      (user) => user.family_id === req.user!.family_id && user.is_active,
    )

    const users = familyUsers.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      birthdate: user.birthdate,
      total_points: user.total_points,
      created_by: user.created_by,
      last_login: user.last_login,
    }))

    res.json({
      success: true,
      data: users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: (error as Error).message,
    })
  }
})

// GET /auth/users/:id - Get specific user
router.get('/users/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = authModels.getUserById(parseInt(id))

    if (!user || user.family_id !== req.user!.family_id) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        birthdate: user.birthdate,
        total_points: user.total_points,
        created_by: user.created_by,
        last_login: user.last_login,
        is_active: user.is_active,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: (error as Error).message,
    })
  }
})

// PUT /auth/users/:id - Update user profile
router.put('/users/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, birthdate } = req.body
    const targetUserId = parseInt(id)

    const targetUser = authModels.getUserById(targetUserId)
    if (!targetUser || targetUser.family_id !== req.user!.family_id) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Check permissions
    const canUpdate =
      req.user!.id === targetUserId || // Own profile
      (req.user!.role === 'parent' && targetUser.role === 'child') // Parent updating child

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
      })
    }

    // Update user
    const updates: Partial<authModels.User> = {}
    if (name) updates.name = name
    if (birthdate) updates.birthdate = birthdate

    const updatedUser = authModels.updateUser(targetUserId, updates)
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        birthdate: updatedUser.birthdate,
        total_points: updatedUser.total_points,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: (error as Error).message,
    })
  }
})

// PATCH /auth/users/:id - Partially update user
router.patch('/users/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, birthdate } = req.body
    const targetUserId = parseInt(id)

    if (!name && !birthdate) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (name or birthdate) must be provided',
      })
    }

    const targetUser = authModels.getUserById(targetUserId)
    if (!targetUser || targetUser.family_id !== req.user!.family_id) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Check permissions
    const canUpdate =
      req.user!.id === targetUserId || // Own profile
      (req.user!.role === 'parent' && targetUser.role === 'child') // Parent updating child

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
      })
    }

    // Update user
    const updates: Partial<authModels.User> = {}
    if (name) updates.name = name
    if (birthdate) updates.birthdate = birthdate

    const updatedUser = authModels.updateUser(targetUserId, updates)

    res.json({
      success: true,
      data: {
        id: updatedUser!.id,
        name: updatedUser!.name,
        birthdate: updatedUser!.birthdate,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: (error as Error).message,
    })
  }
})

// DELETE /auth/users/:id - Deactivate user
router.delete('/users/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const targetUserId = parseInt(id)

    const targetUser = authModels.getUserById(targetUserId)
    if (!targetUser || targetUser.family_id !== req.user!.family_id) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Prevent deleting the primary parent
    const family = authModels.getFamilyById(req.user!.family_id)
    if (family && targetUserId === family.primary_parent_id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete the primary parent',
      })
    }

    // Only parents can delete child accounts
    if (req.user!.role !== 'parent') {
      return res.status(403).json({
        success: false,
        error: 'Only parents can delete accounts',
      })
    }

    // Deactivate user instead of deleting
    authModels.updateUser(targetUserId, { is_active: false })

    res.json({
      success: true,
      message: 'User account deactivated successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: (error as Error).message,
    })
  }
})

// POST /auth/logout - Logout user (placeholder)
router.post('/logout', requireAuth, (req: Request, res: Response) => {
  // TODO: Implement session invalidation
  res.json({
    success: true,
    message: 'Logged out successfully',
  })
})

export default router
