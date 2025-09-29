/**
 * Tests for authentication routes
 */

import request from 'supertest'
import app from '../../app'

// Mock auth models
jest.mock('../../models/auth-prisma')
import * as authModels from '../../models/auth-prisma'

// Mock middleware
jest.mock('../../middleware/auth')
import {
  createSession,
  requireAuth,
  requireParent,
  getCurrentUser,
} from '../../middleware/auth'

describe('Authentication Routes', () => {
  const mockAuthModels = authModels as jest.Mocked<typeof authModels>
  const mockCreateSession = createSession as jest.MockedFunction<
    typeof createSession
  >
  const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>
  const mockRequireParent = requireParent as jest.MockedFunction<
    typeof requireParent
  >
  const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<
    typeof getCurrentUser
  >

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/signup', () => {
    it('should create new family account successfully', async () => {
      const signupData = {
        email: 'parent@example.com',
        name: 'Test Parent',
        familyName: 'Test Family',
        birthdate: '1985-06-15',
      }

      const mockFamily = { id: 1, name: signupData.familyName }
      const mockUser = { id: 1, ...signupData, role: 'parent' }

      mockAuthModels.getUserByEmail.mockResolvedValue(null)
      mockAuthModels.createFamily.mockResolvedValue(mockFamily as any)
      mockAuthModels.createUser.mockResolvedValue(mockUser as any)
      mockAuthModels.createMagicToken.mockResolvedValue({} as any)

      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(signupData.email)
      expect(response.body.data.family.name).toBe(signupData.familyName)

      expect(mockAuthModels.createFamily).toHaveBeenCalledWith({
        name: signupData.familyName,
        primaryParentId: 1,
      })
      expect(mockAuthModels.createUser).toHaveBeenCalled()
      expect(mockAuthModels.createMagicToken).toHaveBeenCalled()
    })

    it('should reject duplicate email addresses', async () => {
      const signupData = {
        email: 'existing@example.com',
        name: 'Test User',
        familyName: 'Test Family',
      }

      mockAuthModels.getUserByEmail.mockResolvedValue({} as any)

      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(409)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('User with this email already exists')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com' })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe(
        'Email, name, and family name are required',
      )
    })

    it('should require JSON Accept header', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Accept', 'text/html')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          familyName: 'Test Family',
        })

      expect(response.status).toBe(406)
      expect(response.body.error).toBe('Not Acceptable')
    })
  })

  describe('POST /api/auth/send-magic-link', () => {
    it('should send magic link to existing user', async () => {
      const testUser = { ...testUtils.createTestUser(), isActive: true }

      mockAuthModels.getUserByEmail.mockResolvedValue(testUser as any)
      mockAuthModels.createMagicToken.mockResolvedValue({} as any)

      const response = await request(app)
        .post('/api/auth/send-magic-link')
        .send({ email: testUser.email })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Magic link sent to your email!')

      expect(mockAuthModels.createMagicToken).toHaveBeenCalled()
    })

    it('should return error for non-existent user', async () => {
      mockAuthModels.getUserByEmail.mockResolvedValue(null)

      const response = await request(app)
        .post('/api/auth/send-magic-link')
        .send({ email: 'nonexistent@example.com' })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('User not found or inactive')
    })
  })

  describe('GET /api/auth/verify', () => {
    it('should verify valid magic token and create session', async () => {
      const testUser = testUtils.createTestUser()
      const testFamily = testUtils.createTestFamily()
      const mockToken = {
        id: 1,
        userId: testUser.id,
        token: 'magic_test_token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        used: false,
        user: { ...testUser, isActive: true },
      }

      mockAuthModels.getMagicToken.mockResolvedValue(mockToken as any)
      mockAuthModels.getUserById.mockResolvedValue({
        ...testUser,
        isActive: true,
      } as any)
      mockAuthModels.getFamilyById.mockResolvedValue(testFamily as any)
      mockAuthModels.markTokenAsUsed.mockResolvedValue(true)
      mockAuthModels.markTokenAsUsed.mockResolvedValue(true)
      mockAuthModels.updateUser.mockResolvedValue(testUser as any)
      mockCreateSession.mockReturnValue('session_test_token_123')

      const response = await request(app)
        .get('/api/auth/verify?token=magic_test_token')
        .set('Accept', 'application/json')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.sessionToken).toBe('session_test_token_123')
      expect(response.body.data.user).toEqual(
        expect.objectContaining({
          email: testUser.email,
          name: testUser.name,
          role: testUser.role,
          familyId: testUser.familyId,
        }),
      )

      expect(mockAuthModels.markTokenAsUsed).toHaveBeenCalledWith(
        'magic_test_token',
      )
      expect(mockAuthModels.updateUser).toHaveBeenCalled()
    })

    it('should reject invalid magic token', async () => {
      mockAuthModels.getMagicToken.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/auth/verify?token=invalid_token')
        .set('Accept', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid or expired token')
    })

    it('should reject expired magic token', async () => {
      const expiredToken = {
        id: 1,
        userId: 1,
        token: 'expired_token',
        expiresAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        used: false,
        user: testUtils.createTestUser(),
      }

      mockAuthModels.getMagicToken.mockResolvedValue(expiredToken as any)

      const response = await request(app)
        .get('/api/auth/verify?token=expired_token')
        .set('Accept', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Token has expired')
    })
  })

  describe('GET /api/auth/me (Protected)', () => {
    it('should return current user info when authenticated', async () => {
      const testUser = { ...testUtils.createTestUser(), isActive: true }

      // Mock middleware and getCurrentUser
      mockRequireAuth.mockImplementation(
        async (req: any, res: any, next: any) => {
          req.user = testUser
          next()
        },
      )
      mockGetCurrentUser.mockReturnValue(testUser)

      const response = await request(app)
        .get('/api/auth/me')
        .set('Accept', 'application/json')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toEqual(
        expect.objectContaining({
          email: testUser.email,
          name: testUser.name,
        }),
      )
    })
  })

  describe('POST /api/auth/create-child (Protected)', () => {
    it('should create child account when parent is authenticated', async () => {
      const childData = {
        email: 'child@example.com',
        name: 'Test Child',
        birthdate: '2015-03-15',
      }

      // Mock middleware and functions
      const testUser = {
        ...testUtils.createTestUser(),
        role: 'parent',
        isActive: true,
      }
      const mockChild = { id: 2, ...childData, role: 'child' }

      mockRequireAuth.mockImplementation(
        async (req: any, res: any, next: any) => {
          req.user = testUser
          next()
        },
      )

      mockRequireParent.mockImplementation(
        async (req: any, res: any, next: any) => {
          next()
        },
      )

      mockGetCurrentUser.mockReturnValue(testUser)

      mockAuthModels.createUser.mockResolvedValue(mockChild as any)

      const response = await request(app)
        .post('/api/auth/create-child')
        .send(childData)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.child).toEqual(
        expect.objectContaining({
          email: childData.email,
          name: childData.name,
          role: 'child',
        }),
      )
    })
  })
})
