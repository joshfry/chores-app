/**
 * Authentication Data Models with Prisma
 * Database operations for users, families, and authentication
 */

import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

// Type aliases from Prisma schema models
type User = Prisma.UserGetPayload<{}>
type Family = Prisma.FamilyGetPayload<{}>
type MagicToken = Prisma.MagicTokenGetPayload<{}>
type WebAuthnCredential = Prisma.WebAuthnCredentialGetPayload<{}>
type Role = Prisma.UserGetPayload<{}>['role']

// Re-export types for easier importing
export type { User, Family, MagicToken, WebAuthnCredential, Role }

// User CRUD operations
export const getAllUsers = async () => {
  return prisma.user.findMany({
    include: {
      family: true,
    },
  })
}

export const getUserById = async (id: number): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      family: true,
    },
  })
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      family: true,
    },
  })
}

export const createUser = async (userData: {
  email: string
  role: Role
  familyId: number
  name: string
  birthdate: string
  createdBy?: number | null
}): Promise<User> => {
  return prisma.user.create({
    data: {
      email: userData.email,
      role: userData.role,
      familyId: userData.familyId,
      name: userData.name,
      birthdate: userData.birthdate,
      createdBy: userData.createdBy,
      lastLogin: new Date(),
      isActive: true,
    },
    include: {
      family: true,
    },
  })
}

export const updateUser = async (
  id: number,
  updates: Partial<Pick<User, 'name' | 'birthdate' | 'lastLogin' | 'isActive'>>,
): Promise<User | null> => {
  try {
    return await prisma.user.update({
      where: { id },
      data: updates,
      include: {
        family: true,
      },
    })
  } catch (error) {
    // User not found
    return null
  }
}

export const deleteUser = async (id: number): Promise<boolean> => {
  try {
    await prisma.user.delete({
      where: { id },
    })
    return true
  } catch (error) {
    // User not found or constraint error
    return false
  }
}

// Family CRUD operations
export const getAllFamilies = async () => {
  return prisma.family.findMany({
    include: {
      users: true,
      chores: true,
      assignments: true,
    },
  })
}

export const getFamilyById = async (id: number): Promise<Family | null> => {
  return prisma.family.findUnique({
    where: { id },
    include: {
      users: true,
      chores: true,
      assignments: true,
    },
  })
}

export const createFamily = async (familyData: {
  name: string
  primaryParentId: number
}): Promise<Family> => {
  return prisma.family.create({
    data: {
      name: familyData.name,
      primaryParentId: familyData.primaryParentId,
    },
  })
}

// Magic Token operations
export const createMagicToken = async (
  userId: number,
  token: string,
  expiresAt: string,
): Promise<MagicToken> => {
  return prisma.magicToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(expiresAt),
    },
  })
}

export const getMagicToken = async (
  token: string,
): Promise<(MagicToken & { user?: User | null }) | null> => {
  return prisma.magicToken.findFirst({
    where: {
      token,
      used: false, // CRITICAL: Only return unused tokens
      expiresAt: {
        gte: new Date(),
      },
    },
    include: {
      user: true,
    },
  })
}

export const markTokenAsUsed = async (token: string): Promise<boolean> => {
  try {
    await prisma.magicToken.update({
      where: { token },
      data: { used: true },
    })
    return true
  } catch (error) {
    return false
  }
}

// WebAuthn Credential operations
export const getCredentialsByUserId = async (
  userId: number,
): Promise<WebAuthnCredential[]> => {
  return prisma.webAuthnCredential.findMany({
    where: { userId },
  })
}

export const createCredential = async (credentialData: {
  userId: number
  credentialId: string
  publicKey: string
  deviceName: string
}): Promise<WebAuthnCredential> => {
  return prisma.webAuthnCredential.create({
    data: credentialData,
  })
}

// Helper function to seed initial data (for development)
export const seedDatabase = async () => {
  // Check if we already have data
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    console.log('📊 Database already has data, skipping seed')
    return
  }

  console.log('🌱 Seeding database with initial data...')

  // Create Johnson family
  const family = await createFamily({
    name: 'Johnson Family',
    primaryParentId: 1, // Will be updated after creating parent
  })

  // Create parent user
  const parent = await createUser({
    email: 'parent@example.com',
    role: 'parent',
    familyId: family.id,
    name: 'Sarah Johnson',
    birthdate: '1985-03-15',
    createdBy: null,
  })

  // Update family with correct primary parent ID
  await prisma.family.update({
    where: { id: family.id },
    data: { primaryParentId: parent.id },
  })

  // Create child users
  await createUser({
    email: 'child1@example.com',
    role: 'child',
    familyId: family.id,
    name: 'Emma Johnson',
    birthdate: '2010-07-22',
    createdBy: parent.id,
  })

  await createUser({
    email: 'child2@example.com',
    role: 'child',
    familyId: family.id,
    name: 'Alex Johnson',
    birthdate: '2013-11-08',
    createdBy: parent.id,
  })

  // Create sample chores
  const chore1 = await prisma.chore.create({
    data: {
      title: 'Clean bedroom',
      description: 'Make bed, organize toys, vacuum floor',
      category: 'cleaning',
      isRecurring: false,
      familyId: family.id,
    },
  })

  const chore2 = await prisma.chore.create({
    data: {
      title: 'Take out trash',
      description: 'Empty all trash cans and take to curb',
      category: 'cleaning',
      isRecurring: true,
      recurrenceDays: JSON.stringify(['monday', 'thursday']),
      familyId: family.id,
    },
  })

  // Create sample assignment
  const nextSunday = new Date()
  const dayOfWeek = nextSunday.getDay()
  nextSunday.setDate(
    nextSunday.getDate() + (dayOfWeek === 0 ? 0 : 7 - dayOfWeek),
  )
  const startDate = nextSunday.toISOString().split('T')[0]

  const endDate = new Date(nextSunday)
  endDate.setDate(nextSunday.getDate() + 6)
  const endDateStr = endDate.toISOString().split('T')[0]

  await prisma.assignment.create({
    data: {
      childId: parent.id + 1, // Assumes first child
      startDate,
      endDate: endDateStr,
      status: 'assigned',
      familyId: family.id,
      assignmentChores: {
        create: [
          { choreId: chore1.id, status: 'pending' },
          { choreId: chore2.id, status: 'pending' },
        ],
      },
    },
  })

  console.log('✅ Database seeded successfully!')
}
