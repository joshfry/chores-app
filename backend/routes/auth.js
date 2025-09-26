/**
 * Authentication Routes
 * Handles passwordless authentication, user management, and family setup
 */

const express = require('express')
const router = express.Router()
const authModels = require('../models/auth')
const {
  createSession,
  requireAuth,
  requireParent,
  getCurrentUser,
} = require('../middleware/auth')
const { v4: uuidv4 } = require('uuid')

// Mock email service (replace with real nodemailer setup later)
const sendMagicLink = async (email, token) => {
  console.log(`📧 Mock Email sent to ${email}`)
  console.log(`🔗 Magic Link: http://localhost:3000/auth/verify?token=${token}`)
  return true
}

// POST /auth/signup - Parent creates family account
router.post('/signup', (req, res) => {
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
    })

    // Create parent user
    const user = authModels.createUser({
      email,
      role: 'parent',
      family_id: family.id,
      name,
      birthdate: birthdate || null,
      total_points: null,
      created_by: null,
    })

    // Update family with primary parent
    family.primary_parent_id = user.id

    // Create magic token
    const magicToken = authModels.createMagicToken(user.id)

    // Send magic link (mock for now)
    sendMagicLink(email, magicToken.token)

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
      message: error.message,
    })
  }
})

// POST /auth/send-magic-link - Send magic link to existing user
router.post('/send-magic-link', (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      })
    }

    // Find user by email
    const user = authModels.getUserByEmail(email)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive',
      })
    }

    // Create magic token
    const magicToken = authModels.createMagicToken(user.id)

    // Send magic link
    sendMagicLink(email, magicToken.token)

    res.json({
      success: true,
      message: 'Magic link sent to your email!',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// GET /auth/verify - Verify magic link token
router.get('/verify', (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      })
    }

    // Find and validate token
    const magicToken = authModels.getMagicToken(token)
    if (!magicToken) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token',
      })
    }

    // Check if token is expired
    if (new Date() > new Date(magicToken.expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'Token has expired',
      })
    }

    // Get user
    const user = authModels.getUserById(magicToken.user_id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Mark token as used
    authModels.useMagicToken(token)

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
      message: 'Login successful!',
      data: {
        sessionToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          family_id: user.family_id,
          total_points: user.total_points,
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
      message: error.message,
    })
  }
})

// GET /auth/me - Get current user info (protected route)
router.get('/me', requireAuth, getCurrentUser)

// POST /auth/create-child - Parent creates child account (protected route)
router.post('/create-child', requireAuth, requireParent, (req, res) => {
  try {
    const { email, name, birthdate } = req.body
    const parentId = req.user.id // From auth middleware

    // Validation
    if (!email || !name || !birthdate) {
      return res.status(400).json({
        success: false,
        error: 'Email, name, and birthdate are required',
      })
    }

    // Check if child email already exists
    const existingUser = authModels.getUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      })
    }

    // Create child user in parent's family
    const child = authModels.createUser({
      email,
      role: 'child',
      family_id: req.user.family_id,
      name,
      birthdate,
      total_points: 0,
      created_by: parentId,
    })

    // Create magic token for child to activate account
    const magicToken = authModels.createMagicToken(child.id)

    // Send magic link to child (mock for now)
    sendMagicLink(email, magicToken.token)

    res.status(201).json({
      success: true,
      message: "Child account created! Magic link sent to child's email.",
      data: {
        child: {
          id: child.id,
          email: child.email,
          name: child.name,
          role: child.role,
          family_id: child.family_id,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// GET /auth/family/:familyId/members - Get all family members (protected route)
router.get('/family/:familyId/members', requireAuth, (req, res) => {
  try {
    const { familyId } = req.params

    // Get all users in the family
    const familyMembers = authModels
      .getAllUsers()
      .filter((user) => user.family_id === parseInt(familyId))

    // Get family info
    const family = authModels.getFamilyById(familyId)
    if (!family) {
      return res.status(404).json({
        success: false,
        error: 'Family not found',
      })
    }

    res.json({
      success: true,
      data: {
        family: {
          id: family.id,
          name: family.name,
        },
        members: familyMembers.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          total_points: user.total_points,
          last_login: user.last_login,
          is_active: user.is_active,
        })),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// POST /auth/logout - Logout user (placeholder for future session management)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  })
})

// ============================================================================
// CRUD ENDPOINTS FOR USER MANAGEMENT
// ============================================================================

// GET /auth/users - List all users in current user's family (protected route)
router.get('/users', requireAuth, (req, res) => {
  try {
    // Get all users in the same family
    const familyUsers = authModels
      .getAllUsers()
      .filter((user) => user.family_id === req.user.family_id && user.is_active)

    // Get family info
    const family = authModels.getFamilyById(req.user.family_id)

    res.json({
      success: true,
      data: {
        family: family
          ? {
              id: family.id,
              name: family.name,
            }
          : null,
        users: familyUsers.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          birthdate: user.birthdate,
          total_points: user.total_points,
          last_login: user.last_login,
          is_active: user.is_active,
          created_by: user.created_by,
        })),
        total_count: familyUsers.length,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// GET /auth/users/:id - Get specific user by ID (protected route)
router.get('/users/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const user = authModels.getUserById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Check if user is in the same family
    if (user.family_id !== req.user.family_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only access users in your family',
      })
    }

    if (!user.is_active) {
      return res.status(404).json({
        success: false,
        error: 'User not found or inactive',
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          birthdate: user.birthdate,
          total_points: user.total_points,
          last_login: user.last_login,
          is_active: user.is_active,
          created_by: user.created_by,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// PUT /auth/users/:id - Update user profile (protected route)
router.put('/users/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const { name, email, birthdate } = req.body
    const targetUser = authModels.getUserById(id)

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Check if user is in the same family
    if (targetUser.family_id !== req.user.family_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only modify users in your family',
      })
    }

    // Authorization check:
    // - Users can modify their own profile
    // - Parents can modify their children's profiles
    const isSelf = parseInt(id) === req.user.id
    const isParentModifyingChild =
      req.user.role === 'parent' && targetUser.role === 'child'

    if (!isSelf && !isParentModifyingChild) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message:
          "You can only modify your own profile or your children's profiles",
      })
    }

    // Validate email uniqueness (if changing email)
    if (email && email !== targetUser.email) {
      const existingUser = authModels.getUserByEmail(email)
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists',
          message: 'Another user already has this email address',
        })
      }
    }

    // Prepare updates
    const updates = {}
    if (name && name.trim()) updates.name = name.trim()
    if (email && email.trim()) updates.email = email.trim()
    if (birthdate) updates.birthdate = birthdate

    // Update user
    const updatedUser = authModels.updateUser(id, updates)

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update user',
      })
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          birthdate: updatedUser.birthdate,
          total_points: updatedUser.total_points,
          last_login: updatedUser.last_login,
          is_active: updatedUser.is_active,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// PATCH /auth/users/:id - Partial update user profile (protected route)
router.patch('/users/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const targetUser = authModels.getUserById(id)

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Check if user is in the same family
    if (targetUser.family_id !== req.user.family_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only modify users in your family',
      })
    }

    // Authorization check
    const isSelf = parseInt(id) === req.user.id
    const isParentModifyingChild =
      req.user.role === 'parent' && targetUser.role === 'child'

    if (!isSelf && !isParentModifyingChild) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message:
          "You can only modify your own profile or your children's profiles",
      })
    }

    // Validate email uniqueness (if changing email)
    if (updates.email && updates.email !== targetUser.email) {
      const existingUser = authModels.getUserByEmail(updates.email)
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists',
          message: 'Another user already has this email address',
        })
      }
    }

    // Filter allowed fields for update
    const allowedFields = ['name', 'email', 'birthdate']
    const filteredUpdates = {}
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        message: 'Provide at least one field to update: name, email, birthdate',
      })
    }

    // Update user
    const updatedUser = authModels.updateUser(id, filteredUpdates)

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update user',
      })
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          birthdate: updatedUser.birthdate,
          total_points: updatedUser.total_points,
          last_login: updatedUser.last_login,
          is_active: updatedUser.is_active,
        },
        updated_fields: Object.keys(filteredUpdates),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// DELETE /auth/users/:id - Deactivate user (soft delete - protected route)
router.delete('/users/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const targetUser = authModels.getUserById(id)

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      })
    }

    // Check if user is in the same family
    if (targetUser.family_id !== req.user.family_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only manage users in your family',
      })
    }

    // Authorization check:
    // - Users can deactivate their own account
    // - Parents can deactivate their children's accounts
    // - Cannot deactivate the primary parent (family owner)
    const isSelf = parseInt(id) === req.user.id
    const isParentDeactivatingChild =
      req.user.role === 'parent' && targetUser.role === 'child'

    if (!isSelf && !isParentDeactivatingChild) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message:
          "You can only deactivate your own account or your children's accounts",
      })
    }

    // Check if trying to deactivate primary parent
    const family = authModels.getFamilyById(targetUser.family_id)
    if (family && family.primary_parent_id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot deactivate primary parent',
        message: 'Transfer family ownership before deactivating this account',
      })
    }

    // Soft delete - mark as inactive
    const updatedUser = authModels.updateUser(id, {
      is_active: false,
      // Keep email unique by adding timestamp suffix when deactivated
      email: `${targetUser.email}.deactivated.${Date.now()}`,
    })

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to deactivate user',
      })
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          role: updatedUser.role,
          is_active: updatedUser.is_active,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    })
  }
})

module.exports = router
