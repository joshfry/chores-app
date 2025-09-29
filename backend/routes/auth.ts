/**
 * Authentication Routes
 * Handles passwordless authentication, user management, and family setup
 */

import express, { Request, Response } from 'express'
import * as authModels from '../models/auth-prisma.js'
import {
  createSession,
  requireAuth,
  requireParent,
  getCurrentUser,
} from '../middleware/auth.js'

const router = express.Router()

// Seed route for development (remove in production)
router.post('/seed', async (req: Request, res: Response) => {
  try {
    await authModels.seedDatabase()
    res.json({
      success: true,
      message: 'Database seeded successfully!',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Seeding failed',
      message: (error as Error).message,
    })
  }
})

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
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, familyName, birthdate } = req.body

    // Validation
    if (!email || !name || !familyName) {
      res.status(400).json({
        success: false,
        error: 'Email, name, and family name are required',
      })
      return
    }

    // Check if user already exists
    const existingUser = await authModels.getUserByEmail(email)
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      })
      return
    }

    // Create family first (temporary primaryParentId)
    const family = await authModels.createFamily({
      name: familyName,
      primaryParentId: 1, // Will be updated below
    })

    // Create parent user
    const user = await authModels.createUser({
      email,
      role: 'parent',
      familyId: family.id,
      name,
      birthdate: birthdate || new Date().toISOString().split('T')[0],
      totalPoints: null,
      createdBy: null,
    })

    // Create magic token
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry
    const magicToken = `magic_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    await authModels.createMagicToken(
      user!.id,
      magicToken,
      expiresAt.toISOString(),
    )

    // Send magic link (mock for now)
    await sendMagicLink(email, magicToken)

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
router.post(
  '/send-magic-link',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required',
        })
        return
      }

      const user = await authModels.getUserByEmail(email)
      if (!user || !user.isActive) {
        res.status(404).json({
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

      await authModels.createMagicToken(
        user!.id,
        magicToken,
        expiresAt.toISOString(),
      )

      // Send magic link (mock for now)
      await sendMagicLink(email, magicToken)

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
  },
)

// GET /auth/verify - Verify magic link and create session
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Token is required',
      })
    }

    const magicToken = await authModels.getMagicToken(token as string)
    if (!magicToken) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
      })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(magicToken!.expiresAt)
    if (now > expiresAt) {
      res.status(400).json({
        success: false,
        error: 'Token has expired',
      })
    }

    // Get user
    const user = await authModels.getUserById(magicToken!.userId)
    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        error: 'User not found or inactive',
      })
    }

    // Mark token as used
    await authModels.markTokenAsUsed(token as string)

    // Update last login
    await authModels.updateUser(user!.id, {
      lastLogin: new Date(),
    })

    // Create session
    const sessionToken = createSession(user!.id)

    // Get family info
    const family = await authModels.getFamilyById(user!.familyId)

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        sessionToken,
        user: {
          id: user!.id,
          email: user!.email,
          name: user!.name,
          role: user!.role,
          familyId: user!.familyId,
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
router.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await getCurrentUser(req)
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        })
      }

      const family = await authModels.getFamilyById(user!.familyId)

      res.json({
        success: true,
        data: {
          user: {
            id: user!.id,
            email: user!.email,
            name: user!.name,
            role: user!.role,
            familyId: user!.familyId,
            birthdate: user!.birthdate,
            totalPoints: user!.totalPoints,
            lastLogin: user!.lastLogin,
          },
          family: family
            ? {
                id: family.id,
                name: family.name,
                createdDate: family.createdDate,
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
  },
)

// POST /auth/create-child - Parent creates child account
router.post(
  '/create-child',
  requireAuth,
  requireParent,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name, birthdate } = req.body

      if (!email || !name || !birthdate) {
        res.status(400).json({
          success: false,
          error: 'Email, name, and birthdate are required',
        })
      }

      // Check if user already exists
      const existingUser = await authModels.getUserByEmail(email)
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'User with this email already exists',
        })
      }

      // Get parent user
      const parent = await getCurrentUser(req)
      if (!parent) {
        res.status(404).json({
          success: false,
          error: 'Parent user not found',
        })
      }

      // Create child user
      const child = await authModels.createUser({
        email,
        role: 'child',
        familyId: parent!.familyId,
        name,
        birthdate,
        totalPoints: 0,
      })

      // Create magic token for child
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry for child setup
      const magicToken = `magic_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`

      await authModels.createMagicToken(
        child.id,
        magicToken,
        expiresAt.toISOString(),
      )

      // Send magic link (mock for now)
      await sendMagicLink(email, magicToken)

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
router.get(
  '/users',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const allUsers = await authModels.getAllUsers()
      const currentUser = await getCurrentUser(req)
      if (!currentUser) {
        res.status(404).json({
          success: false,
          error: 'Current user not found',
        })
      }

      const familyUsers = allUsers.filter(
        (user) => user.familyId === currentUser!.familyId && user.isActive,
      )

      const users = familyUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        birthdate: user.birthdate,
        totalPoints: user.totalPoints,
        createdBy: user.createdBy,
        lastLogin: user.lastLogin,
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
  },
)

// GET /auth/users/:id - Get specific user
router.get(
  '/users/:id',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const user = await authModels.getUserById(parseInt(id))
      const currentUser = await getCurrentUser(req)

      if (!user || !currentUser || user.familyId !== currentUser.familyId) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        })
      }

      res.json({
        success: true,
        data: {
          id: user!.id,
          email: user!.email,
          name: user!.name,
          role: user!.role,
          birthdate: user!.birthdate,
          totalPoints: user!.totalPoints,
          createdBy: user!.createdBy,
          lastLogin: user!.lastLogin,
          isActive: user!.isActive,
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

// PUT /auth/users/:id - Update user profile
router.put(
  '/users/:id',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const { name, birthdate } = req.body
      const targetUserId = parseInt(id)

      const targetUser = await authModels.getUserById(targetUserId)
      const currentUser = await getCurrentUser(req)
      if (
        !targetUser ||
        !currentUser ||
        targetUser.familyId !== currentUser.familyId
      ) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        })
      }

      // Check permissions
      const canUpdate =
        currentUser!.id === targetUserId || // Own profile
        (currentUser!.role === 'parent' && targetUser!.role === 'child') // Parent updating child

      if (!canUpdate) {
        res.status(403).json({
          success: false,
          error: 'Permission denied',
        })
      }

      // Update user
      const updates: Partial<authModels.User> = {}
      if (name) updates.name = name
      if (birthdate) updates.birthdate = birthdate

      const updatedUser = await authModels.updateUser(targetUserId, updates)
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        })
      }

      res.json({
        success: true,
        data: {
          id: updatedUser!.id,
          email: updatedUser!.email,
          name: updatedUser!.name,
          role: updatedUser!.role,
          birthdate: updatedUser!.birthdate,
          totalPoints: updatedUser!.totalPoints,
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

// PATCH /auth/users/:id - Partially update user
router.patch('/users/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, birthdate } = req.body
    const targetUserId = parseInt(id)

    if (!name && !birthdate) {
      res.status(400).json({
        success: false,
        error: 'At least one field (name or birthdate) must be provided',
      })
    }

    const targetUser = await authModels.getUserById(targetUserId)
    const currentUser = await getCurrentUser(req)
    if (
      !targetUser ||
      !currentUser ||
      targetUser.familyId !== currentUser.familyId
    ) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Check permissions
    const canUpdate =
      currentUser!.id === targetUserId || // Own profile
      (currentUser!.role === 'parent' && targetUser!.role === 'child') // Parent updating child

    if (!canUpdate) {
      res.status(403).json({
        success: false,
        error: 'Permission denied',
      })
    }

    // Update user
    const updates: Partial<authModels.User> = {}
    if (name) updates.name = name
    if (birthdate) updates.birthdate = birthdate

    const updatedUser = await authModels.updateUser(targetUserId, updates)

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

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
router.delete(
  '/users/:id',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const targetUserId = parseInt(id)

      const targetUser = await authModels.getUserById(targetUserId)
      const currentUser = await getCurrentUser(req)
      if (
        !targetUser ||
        !currentUser ||
        targetUser.familyId !== currentUser.familyId
      ) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        })
      }

      // Prevent deleting the primary parent
      const family = await authModels.getFamilyById(currentUser!.familyId)
      if (family && targetUserId === family.primaryParentId) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete the primary parent',
        })
      }

      // Only parents can delete child accounts
      if (currentUser!.role !== 'parent') {
        res.status(403).json({
          success: false,
          error: 'Only parents can delete accounts',
        })
      }

      // Deactivate user instead of deleting
      await authModels.updateUser(targetUserId, { isActive: false })

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
  },
)

// POST /auth/logout - Logout user (placeholder)
router.post('/logout', requireAuth, (req: Request, res: Response) => {
  // TODO: Implement session invalidation
  res.json({
    success: true,
    message: 'Logged out successfully',
  })
})

export default router
