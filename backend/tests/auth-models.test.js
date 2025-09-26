/**
 * Authentication Models Tests
 * Tests for user, family, and token management functions
 */

const authModels = require('../models/auth')

describe('Authentication Models', () => {
  beforeEach(() => {
    // Reset mock data to initial state before each test
    jest.clearAllMocks()
  })

  describe('User Management', () => {
    test('should get all users', () => {
      const users = authModels.getAllUsers()
      expect(users).toBeDefined()
      expect(Array.isArray(users)).toBe(true)
      expect(users.length).toBeGreaterThan(0)
    })

    test('should get user by ID', () => {
      const user = authModels.getUserById(1)
      expect(user).toBeDefined()
      expect(user.id).toBe(1)
      expect(user.email).toBe('parent@example.com')
      expect(user.role).toBe('parent')
    })

    test('should return null for non-existent user ID', () => {
      const user = authModels.getUserById(999)
      expect(user).toBeUndefined()
    })

    test('should get user by email', () => {
      const user = authModels.getUserByEmail('parent@example.com')
      expect(user).toBeDefined()
      expect(user.id).toBe(1)
      expect(user.role).toBe('parent')
    })

    test('should return null for non-existent email', () => {
      const user = authModels.getUserByEmail('nonexistent@example.com')
      expect(user).toBeUndefined()
    })

    test('should create new user', () => {
      const newUserData = {
        email: 'newuser@example.com',
        role: 'child',
        family_id: 1,
        name: 'New Child',
        birthdate: '2015-01-01',
        total_points: 0,
        created_by: 1,
      }

      const initialUserCount = authModels.getAllUsers().length
      const newUser = authModels.createUser(newUserData)

      expect(newUser).toBeDefined()
      expect(newUser.email).toBe(newUserData.email)
      expect(newUser.role).toBe(newUserData.role)
      expect(newUser.is_active).toBe(true)
      expect(newUser.last_login).toBeNull()
      expect(newUser.id).toBe(initialUserCount + 1)

      // Verify user was added to the list
      const updatedUserCount = authModels.getAllUsers().length
      expect(updatedUserCount).toBe(initialUserCount + 1)
    })

    test('should update existing user', () => {
      const userId = 1
      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com',
      }

      const updatedUser = authModels.updateUser(userId, updates)

      expect(updatedUser).toBeDefined()
      expect(updatedUser.id).toBe(userId)
      expect(updatedUser.name).toBe(updates.name)
      expect(updatedUser.email).toBe(updates.email)
    })

    test('should return null when updating non-existent user', () => {
      const updatedUser = authModels.updateUser(999, { name: 'Test' })
      expect(updatedUser).toBeNull()
    })
  })

  describe('Family Management', () => {
    test('should get all families', () => {
      const families = authModels.getAllFamilies()
      expect(families).toBeDefined()
      expect(Array.isArray(families)).toBe(true)
      expect(families.length).toBeGreaterThan(0)
    })

    test('should get family by ID', () => {
      const family = authModels.getFamilyById(1)
      expect(family).toBeDefined()
      expect(family.id).toBe(1)
      expect(family.name).toBe('Johnson Family')
      expect(family.primary_parent_id).toBe(1)
    })

    test('should return null for non-existent family ID', () => {
      const family = authModels.getFamilyById(999)
      expect(family).toBeUndefined()
    })

    test('should create new family', () => {
      const familyData = {
        name: 'Smith Family',
      }

      const initialFamilyCount = authModels.getAllFamilies().length
      const newFamily = authModels.createFamily(familyData)

      expect(newFamily).toBeDefined()
      expect(newFamily.name).toBe(familyData.name)
      expect(newFamily.id).toBe(initialFamilyCount + 1)
      expect(newFamily.created_date).toBeDefined()

      // Verify family was added to the list
      const updatedFamilyCount = authModels.getAllFamilies().length
      expect(updatedFamilyCount).toBe(initialFamilyCount + 1)
    })
  })

  describe('Magic Token Management', () => {
    test('should create magic token', () => {
      const userId = 1
      const token = authModels.createMagicToken(userId)

      expect(token).toBeDefined()
      expect(token.user_id).toBe(userId)
      expect(token.token).toBeDefined()
      expect(token.token).toContain('magic_')
      expect(token.expires_at).toBeDefined()
      expect(token.used).toBe(false)
    })

    test('should get valid magic token', () => {
      const userId = 1
      const createdToken = authModels.createMagicToken(userId)
      const retrievedToken = authModels.getMagicToken(createdToken.token)

      expect(retrievedToken).toBeDefined()
      expect(retrievedToken.token).toBe(createdToken.token)
      expect(retrievedToken.user_id).toBe(userId)
      expect(retrievedToken.used).toBe(false)
    })

    test('should return null for non-existent token', () => {
      const token = authModels.getMagicToken('nonexistent_token')
      expect(token).toBeUndefined()
    })

    test('should return null for used token', () => {
      const userId = 1
      const createdToken = authModels.createMagicToken(userId)

      // Use the token
      authModels.useMagicToken(createdToken.token)

      // Try to get the used token
      const retrievedToken = authModels.getMagicToken(createdToken.token)
      expect(retrievedToken).toBeUndefined()
    })

    test('should mark token as used', () => {
      const userId = 1
      const createdToken = authModels.createMagicToken(userId)

      const result = authModels.useMagicToken(createdToken.token)
      expect(result).toBe(true)

      // Verify token is now unusable
      const retrievedToken = authModels.getMagicToken(createdToken.token)
      expect(retrievedToken).toBeUndefined()
    })

    test('should return false when trying to use non-existent token', () => {
      const result = authModels.useMagicToken('nonexistent_token')
      expect(result).toBe(false)
    })
  })

  describe('WebAuthn Credentials Management', () => {
    test('should get credentials by user ID', () => {
      const credentials = authModels.getCredentialsByUserId(1)
      expect(credentials).toBeDefined()
      expect(Array.isArray(credentials)).toBe(true)
      expect(credentials.length).toBeGreaterThan(0)
      expect(credentials[0].user_id).toBe(1)
    })

    test('should return empty array for user with no credentials', () => {
      const credentials = authModels.getCredentialsByUserId(999)
      expect(credentials).toBeDefined()
      expect(Array.isArray(credentials)).toBe(true)
      expect(credentials.length).toBe(0)
    })

    test('should create new credential', () => {
      const credentialData = {
        user_id: 2,
        credential_id: 'new_credential_123',
        public_key: 'new_public_key_data',
        device_name: 'Test Device',
      }

      const newCredential = authModels.createCredential(credentialData)

      expect(newCredential).toBeDefined()
      expect(newCredential.user_id).toBe(credentialData.user_id)
      expect(newCredential.credential_id).toBe(credentialData.credential_id)
      expect(newCredential.public_key).toBe(credentialData.public_key)
      expect(newCredential.device_name).toBe(credentialData.device_name)
      expect(newCredential.id).toBeDefined()
    })
  })

  describe('Data Consistency', () => {
    test('should maintain referential integrity between users and families', () => {
      const users = authModels.getAllUsers()
      const families = authModels.getAllFamilies()

      users.forEach((user) => {
        const family = families.find((f) => f.id === user.family_id)
        expect(family).toBeDefined()
      })
    })

    test('should have valid parent-child relationships', () => {
      const users = authModels.getAllUsers()
      const children = users.filter((user) => user.role === 'child')

      children.forEach((child) => {
        if (child.created_by) {
          const parent = users.find((user) => user.id === child.created_by)
          expect(parent).toBeDefined()
          expect(parent.role).toBe('parent')
          expect(parent.family_id).toBe(child.family_id)
        }
      })
    })

    test('should have unique emails among active users', () => {
      const users = authModels.getAllUsers()
      const activeUsers = users.filter((user) => user.is_active)
      const emails = activeUsers.map((user) => user.email)
      const uniqueEmails = [...new Set(emails)]

      expect(emails.length).toBe(uniqueEmails.length)
    })
  })
})
