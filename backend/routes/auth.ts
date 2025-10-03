/**
 * Authentication Routes
 * Handles passwordless authentication, user management, and family setup
 */

import express, { Request, Response, Router } from 'express'
import * as authModels from '../models/auth-prisma'
import {
  createSession,
  requireAuth,
  requireParent,
  getCurrentUser,
} from '../middleware/auth'
import { sendMagicLinkEmail, sendChildInvitationEmail } from '../lib/email'

const router: Router = express.Router()

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

    // Send magic link email
    await sendMagicLinkEmail(email, magicToken, name)

    res.status(201).json({
      success: true,
      message: 'Family account created! Check your email for login link.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          familyId: user.familyId,
          birthdate: user.birthdate,
          lastLogin: user.lastLogin,
          isActive: user.isActive,
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
        return
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

      // Send magic link email
      await sendMagicLinkEmail(email, magicToken, user.name)

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
      return
    }

    const magicToken = await authModels.getMagicToken(token as string)
    if (!magicToken) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
      })
      return
    }

    // Check if token has expired
    if (new Date(magicToken.expiresAt) < new Date()) {
      res.status(400).json({
        success: false,
        error: 'Token has expired',
      })
      return
    }

    // Check if token has already been used
    if (magicToken.used) {
      res.status(400).json({
        success: false,
        error: 'Token has already been used',
      })
      return
    }

    // Get user
    const user = await authModels.getUserById(magicToken.userId)
    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        error: 'User not found or inactive',
      })
      return
    }

    // Mark token as used
    await authModels.markTokenAsUsed(token as string)

    // Update last login
    await authModels.updateUser(user.id, {
      lastLogin: new Date(),
    })

    // Create session
    const sessionToken = createSession(user.id)

    // Get family info
    const family = await authModels.getFamilyById(user.familyId)

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
          familyId: user.familyId,
          birthdate: user.birthdate,
          lastLogin: user.lastLogin,
          isActive: user.isActive,
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
            lastLogin: user!.lastLogin,
            isActive: user!.isActive,
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

// POST /auth/create-child - Parent creates family member account
router.post(
  '/create-child',
  requireAuth,
  requireParent,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name, birthdate, role = 'child' } = req.body

      if (!email || !name) {
        res.status(400).json({
          success: false,
          error: 'Email and name are required',
        })
        return
      }

      // Birthdate is required for children
      if (role === 'child' && !birthdate) {
        res.status(400).json({
          success: false,
          error: 'Birthdate is required for child accounts',
        })
        return
      }

      // Validate role
      if (role !== 'parent' && role !== 'child') {
        res.status(400).json({
          success: false,
          error: 'Role must be either "parent" or "child"',
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

      // Get parent user
      const parent = await getCurrentUser(req)
      if (!parent) {
        res.status(404).json({
          success: false,
          error: 'Parent user not found',
        })
        return
      }

      // Create user
      const newUser = await authModels.createUser({
        email,
        role: role as 'parent' | 'child',
        familyId: parent!.familyId,
        name,
        birthdate: birthdate || new Date().toISOString().split('T')[0], // Use today's date if not provided
      })

      // Create magic token
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry
      const magicToken = `magic_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`

      await authModels.createMagicToken(
        newUser.id,
        magicToken,
        expiresAt.toISOString(),
      )

      // Send invitation email
      await sendChildInvitationEmail(
        email,
        magicToken,
        newUser.name,
        parent!.name,
      )

      res.status(201).json({
        success: true,
        message: `${role === 'parent' ? 'Parent' : 'Child'} account created! Invitation email sent.`,
        data: {
          child: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            birthdate: newUser.birthdate,
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
        return
      }

      const familyUsers = allUsers
        .filter((user) => user.familyId === currentUser!.familyId)
        .sort((a, b) => {
          // Sort by role: parents first, then children
          if (a.role === b.role) {
            // If same role, sort alphabetically by name
            return a.name.localeCompare(b.name)
          }
          // Parents come before children
          return a.role === 'parent' ? -1 : 1
        })

      console.log(
        `Fetching users for family ${currentUser!.familyId}: Found ${familyUsers.length} users`,
      )

      const users = familyUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        birthdate: user.birthdate,
        createdBy: user.createdBy,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
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
        return
      }

      res.json({
        success: true,
        data: {
          id: user!.id,
          email: user!.email,
          name: user!.name,
          role: user!.role,
          birthdate: user!.birthdate,
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

// DELETE /auth/users/:id - Delete user
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
        return
      }

      // Prevent deleting the primary parent
      const family = await authModels.getFamilyById(currentUser!.familyId)
      if (family && targetUserId === family.primaryParentId) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete the primary parent',
        })
        return
      }

      // Only parents can delete accounts
      if (currentUser!.role !== 'parent') {
        res.status(403).json({
          success: false,
          error: 'Only parents can delete accounts',
        })
        return
      }

      // Delete user
      const deleted = await authModels.deleteUser(targetUserId)

      if (!deleted) {
        res.status(500).json({
          success: false,
          error: 'Failed to delete user',
        })
        return
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
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
