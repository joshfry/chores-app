/**
 * Basic Routes
 * Health check and API documentation endpoints
 */

const express = require('express')
const router = express.Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chores API is running!',
    timestamp: new Date().toISOString(),
  })
})

// Root API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Family Chores API',
    version: '1.0.0',
    features: [
      'Passwordless Authentication',
      'Family Management',
      'Chore Tracking',
    ],
    endpoints: {
      // Public endpoints
      health: '/health',

      // Authentication
      signup: 'POST /api/auth/signup',
      sendMagicLink: 'POST /api/auth/send-magic-link',
      verifyMagicLink: 'GET /api/auth/verify?token=...',

      // Protected endpoints (require Authorization: Bearer <sessionToken>)
      currentUser: 'GET /api/auth/me',
      createChild: 'POST /api/auth/create-child',
      familyMembers: 'GET /api/auth/family/:familyId/members',

      // User CRUD operations
      listUsers: 'GET /api/auth/users',
      getUser: 'GET /api/auth/users/:id',
      updateUser: 'PUT /api/auth/users/:id',
      patchUser: 'PATCH /api/auth/users/:id',
      deleteUser: 'DELETE /api/auth/users/:id',

      // Data endpoints (protected)
      children: '/api/children',
      chores: '/api/chores',
      assignments: '/api/assignments',
      dashboard: '/api/dashboard/stats',
    },
    authentication: {
      type: 'passwordless',
      flow: '1. Signup/Login → 2. Magic Link → 3. Get sessionToken → 4. Use in Authorization header',
    },
  })
})

module.exports = router
