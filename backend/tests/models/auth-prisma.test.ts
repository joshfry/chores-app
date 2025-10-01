/**
 * Tests for Prisma-based authentication models
 */

import * as authModels from '../../models/auth-prisma'
import { PrismaClient } from '../../generated/prisma'

// Mock Prisma client
jest.mock('../../generated/prisma', () => ({
  PrismaClient: jest.fn(),
}))

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    family: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    magicToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    webAuthnCredential: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    chore: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    assignment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

describe('Auth Prisma Models', () => {
  const mockPrisma = require('../../lib/prisma').prisma

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Operations', () => {
    describe('createUser', () => {
      it('should create a user with valid data', async () => {
        const userData = testUtils.createTestUser()
        const expectedUser = { id: 1, ...userData }

        mockPrisma.user.create.mockResolvedValue(expectedUser as any)

        const result = await authModels.createUser(userData)

        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: {
            email: userData.email,
            role: userData.role,
            name: userData.name,
            familyId: userData.familyId,
            birthdate: userData.birthdate,
            createdBy: userData.createdBy,
            isActive: true,
            lastLogin: expect.any(Date),
          },
          include: { family: true },
        })
        expect(result).toEqual(expectedUser)
      })

      it('should handle creation errors', async () => {
        const userData = testUtils.createTestUser()
        mockPrisma.user.create.mockRejectedValue(new Error('Database error'))

        await expect(authModels.createUser(userData)).rejects.toThrow(
          'Database error',
        )
      })
    })

    describe('getUserByEmail', () => {
      it('should return user when found', async () => {
        const testUser = { id: 1, ...testUtils.createTestUser() }
        mockPrisma.user.findUnique.mockResolvedValue(testUser as any)

        const result = await authModels.getUserByEmail('test@example.com')

        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
          include: { family: true },
        })
        expect(result).toEqual(testUser)
      })

      it('should return null when user not found', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null)

        const result = await authModels.getUserByEmail(
          'nonexistent@example.com',
        )

        expect(result).toBeNull()
      })
    })

    describe('getUserById', () => {
      it('should return user when found', async () => {
        const testUser = { id: 1, ...testUtils.createTestUser() }
        mockPrisma.user.findUnique.mockResolvedValue(testUser as any)

        const result = await authModels.getUserById(1)

        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: 1 },
          include: { family: true },
        })
        expect(result).toEqual(testUser)
      })
    })

    describe('updateUser', () => {
      it('should update user with provided data', async () => {
        const updates = { name: 'Updated Name' }
        const updatedUser = { id: 1, ...testUtils.createTestUser(), ...updates }

        mockPrisma.user.update.mockResolvedValue(updatedUser as any)

        const result = await authModels.updateUser(1, updates)

        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: updates,
          include: { family: true },
        })
        expect(result).toEqual(updatedUser)
      })
    })
  })

  describe('Family Operations', () => {
    describe('createFamily', () => {
      it('should create family with valid data', async () => {
        const familyData = testUtils.createTestFamily()
        const expectedFamily = { id: 1, createdDate: new Date(), ...familyData }

        mockPrisma.family.create.mockResolvedValue(expectedFamily as any)

        const result = await authModels.createFamily(familyData)

        expect(mockPrisma.family.create).toHaveBeenCalledWith({
          data: familyData,
        })
        expect(result).toEqual(expectedFamily)
      })
    })

    describe('getFamilyById', () => {
      it('should return family with relations when found', async () => {
        const testFamily = {
          id: 1,
          ...testUtils.createTestFamily(),
          users: [],
          chores: [],
          assignments: [],
        }

        mockPrisma.family.findUnique.mockResolvedValue(testFamily as any)

        const result = await authModels.getFamilyById(1)

        expect(mockPrisma.family.findUnique).toHaveBeenCalledWith({
          where: { id: 1 },
          include: {
            users: true,
            chores: true,
            assignments: true,
          },
        })
        expect(result).toEqual(testFamily)
      })
    })
  })

  describe('Magic Token Operations', () => {
    describe('createMagicToken', () => {
      it('should create magic token with correct data', async () => {
        const tokenData = {
          userId: 1,
          token: 'magic_test_token',
          expiresAt: new Date('2024-01-01T10:00:00Z'),
        }
        const expectedToken = {
          id: 1,
          used: false,
          createdAt: new Date(),
          ...tokenData,
        }

        mockPrisma.magicToken.create.mockResolvedValue(expectedToken as any)

        const result = await authModels.createMagicToken(
          tokenData.userId,
          tokenData.token,
          tokenData.expiresAt.toISOString(),
        )

        expect(mockPrisma.magicToken.create).toHaveBeenCalledWith({
          data: {
            userId: tokenData.userId,
            token: tokenData.token,
            expiresAt: tokenData.expiresAt,
          },
        })
        expect(result).toEqual(expectedToken)
      })
    })

    describe('getMagicToken', () => {
      it('should return unused token when found', async () => {
        const testToken = {
          id: 1,
          userId: 1,
          token: 'magic_test_token',
          expiresAt: new Date('2024-01-01T10:00:00Z'),
          used: false,
          createdAt: new Date(),
          user: testUtils.createTestUser(),
        }

        mockPrisma.magicToken.findFirst.mockResolvedValue(testToken as any)

        const result = await authModels.getMagicToken('magic_test_token')

        expect(mockPrisma.magicToken.findFirst).toHaveBeenCalledWith({
          where: {
            token: 'magic_test_token',
            used: false,
            expiresAt: { gte: expect.any(Date) },
          },
          include: { user: true },
        })
        expect(result).toEqual(testToken)
      })

      it('should return null for used token', async () => {
        mockPrisma.magicToken.findFirst.mockResolvedValue(null)

        const result = await authModels.getMagicToken('used_token')

        expect(result).toBeNull()
      })
    })

    describe('markTokenAsUsed', () => {
      it('should mark token as used successfully', async () => {
        mockPrisma.magicToken.update.mockResolvedValue({} as any)

        const result = await authModels.markTokenAsUsed('test_token')

        expect(mockPrisma.magicToken.update).toHaveBeenCalledWith({
          where: { token: 'test_token' },
          data: { used: true },
        })
        expect(result).toBe(true)
      })

      it('should return false on error', async () => {
        mockPrisma.magicToken.update.mockRejectedValue(
          new Error('Token not found'),
        )

        const result = await authModels.markTokenAsUsed('nonexistent_token')

        expect(result).toBe(false)
      })
    })
  })

  describe('Database Seeding', () => {
    it('should seed database with sample data', async () => {
      // Mock all the database operations
      mockPrisma.family.create.mockResolvedValue({ id: 1 } as any)
      mockPrisma.user.create.mockResolvedValue({ id: 1 } as any)

      await authModels.seedDatabase()

      // Verify that families and users were created
      expect(mockPrisma.family.create).toHaveBeenCalled()
      expect(mockPrisma.user.create).toHaveBeenCalled()
    })
  })
})
