/**
 * Authentication Routes Tests
 * Tests for auth API endpoints
 */

const request = require('supertest')
const app = require('../app')

describe('Authentication Routes', () => {
  let parentSessionToken
  let childSessionToken

  describe('POST /api/auth/signup', () => {
    test('should create family account successfully', async () => {
      const familyData = {
        email: 'testparent@example.com',
        name: 'Test Parent',
        familyName: 'Test Family',
        birthdate: '1980-01-01',
      }

      const response = await request(app)
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send(familyData)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Check your email')
      expect(response.body.data.user.email).toBe(familyData.email)
      expect(response.body.data.user.role).toBe('parent')
      expect(response.body.data.family.name).toBe(familyData.familyName)
    })

    test('should reject signup with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
          email: 'incomplete@example.com',
          // Missing name and familyName
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('required')
    })

    test('should reject duplicate email signup', async () => {
      // First signup
      await request(app)
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
          email: 'duplicate@example.com',
          name: 'First User',
          familyName: 'First Family',
        })

      // Second signup with same email
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
          email: 'duplicate@example.com',
          name: 'Second User',
          familyName: 'Second Family',
        })

      expect(response.status).toBe(409)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('already exists')
    })
  })

  describe('POST /api/auth/send-magic-link', () => {
    test('should send magic link to existing user', async () => {
      const response = await request(app)
        .post('/api/auth/send-magic-link')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
          email: 'parent@example.com', // From mock data
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Magic link sent')
    })

    test('should reject request for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/send-magic-link')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
          email: 'nonexistent@example.com',
        })

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('not found')
    })

    test('should reject request without email', async () => {
      const response = await request(app)
        .post('/api/auth/send-magic-link')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('required')
    })
  })

  describe('GET /api/auth/verify', () => {
    test('should verify valid magic token and return session', async () => {
      // First create a magic token (normally done by send-magic-link)
      const authModels = require('../models/auth')
      const magicToken = authModels.createMagicToken(1) // Parent user

      const response = await request(app)
        .get(`/api/auth/verify?token=${magicToken.token}`)
        .set('Accept', 'application/json')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Login successful')
      expect(response.body.data.sessionToken).toBeDefined()
      expect(response.body.data.user.email).toBe('parent@example.com')
      expect(response.body.data.family).toBeDefined()

      // Store session token for protected route tests
      parentSessionToken = response.body.data.sessionToken
    })

    test('should reject invalid magic token', async () => {
      const response = await request(app)
        .get('/api/auth/verify?token=invalid_token')
        .set('Accept', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid or expired')
    })

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Accept', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('required')
    })

    test('should reject already used token', async () => {
      const authModels = require('../models/auth')
      const magicToken = authModels.createMagicToken(1)

      // Use the token first time
      await request(app)
        .get(`/api/auth/verify?token=${magicToken.token}`)
        .set('Accept', 'application/json')

      // Try to use the same token again
      const response = await request(app)
        .get(`/api/auth/verify?token=${magicToken.token}`)
        .set('Accept', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid or expired')
    })
  })

  describe('Protected Route Authentication', () => {
    beforeAll(async () => {
      // Get session tokens for testing
      const authModels = require('../models/auth')

      // Parent session
      const parentToken = authModels.createMagicToken(1)
      const parentResponse = await request(app)
        .get(`/api/auth/verify?token=${parentToken.token}`)
        .set('Accept', 'application/json')
      parentSessionToken = parentResponse.body.data.sessionToken

      // Child session
      const childToken = authModels.createMagicToken(2)
      const childResponse = await request(app)
        .get(`/api/auth/verify?token=${childToken.token}`)
        .set('Accept', 'application/json')
      childSessionToken = childResponse.body.data.sessionToken
    })

    describe('GET /api/auth/me', () => {
      test('should return current user info with valid session', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.user.email).toBe('parent@example.com')
        expect(response.body.data.family).toBeDefined()
      })

      test('should reject request without authentication', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Accept', 'application/json')

        expect(response.status).toBe(401)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('Authentication required')
      })

      test('should reject request with invalid session token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer invalid_token')

        expect(response.status).toBe(401)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('Invalid or expired')
      })
    })

    describe('POST /api/auth/create-child', () => {
      test('should allow parent to create child account', async () => {
        const childData = {
          email: 'newchild@example.com',
          name: 'New Test Child',
          birthdate: '2015-05-01',
        }

        const response = await request(app)
          .post('/api/auth/create-child')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)
          .send(childData)

        expect(response.status).toBe(201)
        expect(response.body.success).toBe(true)
        expect(response.body.message).toContain('Child account created')
        expect(response.body.data.child.email).toBe(childData.email)
        expect(response.body.data.child.role).toBe('child')
      })

      test('should reject child trying to create child account', async () => {
        const childData = {
          email: 'anothernewchild@example.com',
          name: 'Another Test Child',
          birthdate: '2016-05-01',
        }

        const response = await request(app)
          .post('/api/auth/create-child')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${childSessionToken}`)
          .send(childData)

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('Parent access required')
      })
    })
  })

  describe('User CRUD Operations', () => {
    describe('GET /api/auth/users', () => {
      test('should list family users for authenticated user', async () => {
        const response = await request(app)
          .get('/api/auth/users')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.users).toBeDefined()
        expect(Array.isArray(response.body.data.users)).toBe(true)
        expect(response.body.data.users.length).toBeGreaterThan(0)
        expect(response.body.data.family).toBeDefined()
      })

      test('should reject unauthenticated request', async () => {
        const response = await request(app)
          .get('/api/auth/users')
          .set('Accept', 'application/json')

        expect(response.status).toBe(401)
        expect(response.body.success).toBe(false)
      })
    })

    describe('GET /api/auth/users/:id', () => {
      test('should get specific user in same family', async () => {
        const response = await request(app)
          .get('/api/auth/users/2') // Child user
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.user.id).toBe(2)
        expect(response.body.data.user.role).toBe('child')
      })

      test('should reject request for non-existent user', async () => {
        const response = await request(app)
          .get('/api/auth/users/999')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)

        expect(response.status).toBe(404)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('not found')
      })
    })

    describe('PUT /api/auth/users/:id', () => {
      test('should allow user to update own profile', async () => {
        const updates = {
          name: 'Updated Parent Name',
          email: 'updated.parent@example.com',
          birthdate: '1985-03-15',
        }

        const response = await request(app)
          .put('/api/auth/users/1') // Parent updating self
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)
          .send(updates)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.user.name).toBe(updates.name)
        expect(response.body.data.user.email).toBe(updates.email)
      })

      test('should allow parent to update child profile', async () => {
        const updates = {
          name: 'Updated Child Name',
          email: 'updated.child@example.com',
          birthdate: '2010-07-22',
        }

        const response = await request(app)
          .put('/api/auth/users/2') // Parent updating child
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)
          .send(updates)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.user.name).toBe(updates.name)
      })

      test('should reject child trying to update parent profile', async () => {
        const updates = {
          name: 'Child Trying to Update Parent',
        }

        const response = await request(app)
          .put('/api/auth/users/1') // Child trying to update parent
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${childSessionToken}`)
          .send(updates)

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('Access denied')
      })
    })

    describe('PATCH /api/auth/users/:id', () => {
      test('should partially update user profile', async () => {
        const updates = {
          name: 'Partially Updated Name',
        }

        const response = await request(app)
          .patch('/api/auth/users/1')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)
          .send(updates)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.user.name).toBe(updates.name)
        expect(response.body.data.updated_fields).toContain('name')
      })

      test('should reject patch with no valid fields', async () => {
        const response = await request(app)
          .patch('/api/auth/users/1')
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)
          .send({})

        expect(response.status).toBe(400)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('No valid fields')
      })
    })

    describe('DELETE /api/auth/users/:id', () => {
      test('should deactivate child account', async () => {
        const response = await request(app)
          .delete('/api/auth/users/3') // Third child user
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)

        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.message).toContain('deactivated')
        expect(response.body.data.user.is_active).toBe(false)
      })

      test('should reject deleting primary parent', async () => {
        const response = await request(app)
          .delete('/api/auth/users/1') // Primary parent
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${parentSessionToken}`)

        expect(response.status).toBe(400)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain(
          'Cannot deactivate primary parent',
        )
      })

      test('should reject child trying to delete parent', async () => {
        const response = await request(app)
          .delete('/api/auth/users/1')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${childSessionToken}`)

        expect(response.status).toBe(403)
        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('Access denied')
      })
    })
  })

  describe('POST /api/auth/logout', () => {
    test('should logout successfully (placeholder)', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({}) // Send empty JSON body

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Logged out')
    })
  })
})
