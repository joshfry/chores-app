/**
 * Authentication Middleware Tests
 * Tests for session management and authorization middleware
 */

const {
  createSession,
  validateSession,
  requireAuth,
  requireParent,
  requireSameFamily,
  getCurrentUser,
} = require('../middleware/auth')

// Mock the auth models
jest.mock('../models/auth')
const authModels = require('../models/auth')

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext
  let testUserId, testSessionToken

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mock request, response, and next
    mockReq = {
      headers: {},
      params: {},
      body: {},
      user: null,
      session: null,
    }

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }

    mockNext = jest.fn()

    // Setup test data
    testUserId = 1
    testSessionToken = null
  })

  describe('createSession', () => {
    test('should create a session token', () => {
      const sessionToken = createSession(testUserId)

      expect(sessionToken).toBeDefined()
      expect(typeof sessionToken).toBe('string')
      expect(sessionToken).toContain('session_')
    })

    test('should create unique session tokens', () => {
      const token1 = createSession(testUserId)
      const token2 = createSession(testUserId)

      expect(token1).not.toBe(token2)
    })
  })

  describe('validateSession', () => {
    test('should validate active session', () => {
      const sessionToken = createSession(testUserId)
      const session = validateSession(sessionToken)

      expect(session).toBeDefined()
      expect(session.userId).toBe(testUserId)
      expect(session.createdAt).toBeDefined()
      expect(session.lastAccess).toBeDefined()
    })

    test('should return null for invalid session token', () => {
      const session = validateSession('invalid_token')
      expect(session).toBeNull()
    })

    test('should update lastAccess on valid session', () => {
      const sessionToken = createSession(testUserId)

      // Get initial session
      const session1 = validateSession(sessionToken)
      const initialLastAccess = session1.lastAccess

      // Wait a bit and validate again
      setTimeout(() => {
        const session2 = validateSession(sessionToken)
        expect(session2.lastAccess.getTime()).toBeGreaterThan(
          initialLastAccess.getTime(),
        )
      }, 10)
    })

    test('should remove expired session', () => {
      const sessionToken = createSession(testUserId)

      // Mock session to be expired (manually modify internal state)
      const session = validateSession(sessionToken)
      session.lastAccess = new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago

      // Next validation should return null
      const expiredSession = validateSession(sessionToken)
      expect(expiredSession).toBeNull()
    })
  })

  describe('requireAuth middleware', () => {
    beforeEach(() => {
      // Mock getUserById to return a test user
      authModels.getUserById.mockReturnValue({
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'parent',
        family_id: 1,
        is_active: true,
      })
    })

    test('should allow request with valid session token', () => {
      const sessionToken = createSession(testUserId)
      mockReq.headers.authorization = `Bearer ${sessionToken}`

      requireAuth(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockReq.user).toBeDefined()
      expect(mockReq.user.id).toBe(testUserId)
      expect(mockReq.session).toBeDefined()
    })

    test('should reject request without Authorization header', () => {
      requireAuth(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Authentication required',
        }),
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    test('should reject request with malformed Authorization header', () => {
      mockReq.headers.authorization = 'Invalid header format'

      requireAuth(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Authentication required',
        }),
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    test('should reject request with invalid session token', () => {
      mockReq.headers.authorization = 'Bearer invalid_token'

      requireAuth(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid or expired session',
        }),
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    test('should reject request for inactive user', () => {
      const sessionToken = createSession(testUserId)
      mockReq.headers.authorization = `Bearer ${sessionToken}`

      // Mock inactive user
      authModels.getUserById.mockReturnValue({
        id: testUserId,
        is_active: false,
      })

      requireAuth(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'User not found or inactive',
        }),
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    test('should reject request for non-existent user', () => {
      const sessionToken = createSession(testUserId)
      mockReq.headers.authorization = `Bearer ${sessionToken}`

      // Mock user not found
      authModels.getUserById.mockReturnValue(null)

      requireAuth(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('requireParent middleware', () => {
    test('should allow parent users', () => {
      mockReq.user = { role: 'parent' }

      requireParent(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    test('should reject child users', () => {
      mockReq.user = { role: 'child' }

      requireParent(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Parent access required',
        }),
      )
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('requireSameFamily middleware', () => {
    beforeEach(() => {
      mockReq.user = { family_id: 1 }
    })

    test('should allow access to same family data via params', () => {
      mockReq.params = { familyId: '1' }

      requireSameFamily(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    test('should allow access to same family data via body', () => {
      mockReq.body = { family_id: 1 }

      requireSameFamily(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    test('should allow access when no family constraint specified', () => {
      // No familyId in params or body
      requireSameFamily(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(mockRes.status).not.toHaveBeenCalled()
    })

    test('should reject access to different family data', () => {
      mockReq.params = { familyId: '2' } // Different family

      requireSameFamily(mockReq, mockRes, mockNext)

      expect(mockRes.status).toHaveBeenCalledWith(403)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Access denied',
        }),
      )
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('getCurrentUser helper', () => {
    beforeEach(() => {
      mockReq.user = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'parent',
        family_id: 1,
        total_points: null,
        last_login: '2024-09-26T12:00:00Z',
      }

      // Mock getFamilyById
      authModels.getFamilyById.mockReturnValue({
        id: 1,
        name: 'Test Family',
      })
    })

    test('should return current user info', () => {
      getCurrentUser(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            role: 'parent',
            family_id: 1,
            total_points: null,
            last_login: '2024-09-26T12:00:00Z',
          },
          family: {
            id: 1,
            name: 'Test Family',
          },
        },
      })
    })

    test('should return user info without family if family not found', () => {
      authModels.getFamilyById.mockReturnValue(null)

      getCurrentUser(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.any(Object),
          family: null,
        },
      })
    })
  })

  describe('Session Management Integration', () => {
    test('should handle complete auth flow', () => {
      // Create session
      const sessionToken = createSession(testUserId)

      // Setup request with session
      mockReq.headers.authorization = `Bearer ${sessionToken}`

      // Mock user data
      authModels.getUserById.mockReturnValue({
        id: testUserId,
        email: 'integration@example.com',
        name: 'Integration Test User',
        role: 'parent',
        family_id: 1,
        is_active: true,
      })

      // Run auth middleware
      requireAuth(mockReq, mockRes, mockNext)

      // Verify auth succeeded
      expect(mockNext).toHaveBeenCalled()
      expect(mockReq.user).toBeDefined()
      expect(mockReq.session).toBeDefined()

      // Run parent check
      requireParent(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(2) // Called twice now

      // Check same family access
      mockReq.params = { familyId: '1' }
      requireSameFamily(mockReq, mockRes, mockNext)
      expect(mockNext).toHaveBeenCalledTimes(3) // Called three times now
    })

    test('should maintain session state across requests', () => {
      const sessionToken = createSession(testUserId)

      // First request
      const session1 = validateSession(sessionToken)
      expect(session1).toBeDefined()

      // Second request (should reuse same session)
      const session2 = validateSession(sessionToken)
      expect(session2).toBeDefined()
      expect(session2.userId).toBe(session1.userId)
    })
  })
})
