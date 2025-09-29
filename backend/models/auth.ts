/**
 * Authentication Data Models
 * Defines data structures for users, families, and authentication
 */

export interface User {
  id: number
  email: string
  role: 'parent' | 'child'
  family_id: number
  name: string
  birthdate: string
  total_points: number | null // Only for children
  created_by: number | null // User ID who created this user
  last_login: string
  is_active: boolean
}

export interface Family {
  id: number
  name: string
  created_date: string
  primary_parent_id: number
}

export interface MagicToken {
  id: number
  user_id: number
  token: string
  expires_at: string
  used: boolean
}

export interface WebAuthnCredential {
  id: number
  user_id: number
  credential_id: string
  public_key: string
  device_name: string
}

// Mock data for development
let users: User[] = [
  {
    id: 1,
    email: 'parent@example.com',
    role: 'parent',
    family_id: 1,
    name: 'Sarah Johnson',
    birthdate: '1985-03-15',
    total_points: null, // Only for children
    created_by: null, // Self-created
    last_login: '2024-09-26T10:30:00Z',
    is_active: true,
  },
  {
    id: 2,
    email: 'child1@example.com',
    role: 'child',
    family_id: 1,
    name: 'Emma Johnson',
    birthdate: '2010-07-22',
    total_points: 145,
    created_by: 1, // Created by parent
    last_login: '2024-09-25T16:45:00Z',
    is_active: true,
  },
  {
    id: 3,
    email: 'child2@example.com',
    role: 'child',
    family_id: 1,
    name: 'Alex Johnson',
    birthdate: '2013-11-08',
    total_points: 89,
    created_by: 1, // Created by parent
    last_login: '2024-09-24T14:20:00Z',
    is_active: true,
  },
]

let families: Family[] = [
  {
    id: 1,
    name: 'Johnson Family',
    created_date: '2024-09-01',
    primary_parent_id: 1,
  },
]

let magicTokens: MagicToken[] = [
  {
    id: 1,
    user_id: 2,
    token: 'magic_token_abc123',
    expires_at: '2024-09-26T23:59:59Z',
    used: false,
  },
]

let webauthnCredentials: WebAuthnCredential[] = [
  {
    id: 1,
    user_id: 1,
    credential_id: 'credential_123',
    public_key: 'public_key_data_here',
    device_name: 'iPhone 15 Pro',
  },
]

// Helper functions for mock data manipulation
let nextUserId = 4
let nextFamilyId = 2
let nextMagicTokenId = 2
let nextWebAuthnId = 2

// User CRUD operations
export const getAllUsers = (): User[] => users

export const getUserById = (id: number): User | null => {
  return users.find((user) => user.id === id) || null
}

export const getUserByEmail = (email: string): User | null => {
  return users.find((user) => user.email === email) || null
}

export const createUser = (userData: Omit<User, 'id'>): User => {
  const newUser: User = {
    id: nextUserId++,
    ...userData,
  }
  users.push(newUser)
  return newUser
}

export const updateUser = (id: number, updates: Partial<User>): User | null => {
  const userIndex = users.findIndex((user) => user.id === id)
  if (userIndex === -1) return null

  users[userIndex] = { ...users[userIndex], ...updates }
  return users[userIndex]
}

// Family CRUD operations
export const getAllFamilies = (): Family[] => families

export const getFamilyById = (id: number): Family | null => {
  return families.find((family) => family.id === id) || null
}

export const createFamily = (familyData: Omit<Family, 'id'>): Family => {
  const newFamily: Family = {
    id: nextFamilyId++,
    ...familyData,
  }
  families.push(newFamily)
  return newFamily
}

// Magic Token operations
export const createMagicToken = (
  userId: number,
  token: string,
  expiresAt: string,
): MagicToken => {
  const newToken: MagicToken = {
    id: nextMagicTokenId++,
    user_id: userId,
    token,
    expires_at: expiresAt,
    used: false,
  }
  magicTokens.push(newToken)
  return newToken
}

export const getMagicToken = (token: string): MagicToken | null => {
  return magicTokens.find((t) => t.token === token && !t.used) || null
}

export const markTokenAsUsed = (token: string): boolean => {
  const tokenIndex = magicTokens.findIndex((t) => t.token === token)
  if (tokenIndex === -1) return false

  magicTokens[tokenIndex].used = true
  return true
}

// WebAuthn Credential operations
export const getCredentialsByUserId = (
  userId: number,
): WebAuthnCredential[] => {
  return webauthnCredentials.filter((cred) => cred.user_id === userId)
}

export const createCredential = (
  credentialData: Omit<WebAuthnCredential, 'id'>,
): WebAuthnCredential => {
  const newCredential: WebAuthnCredential = {
    id: nextWebAuthnId++,
    ...credentialData,
  }
  webauthnCredentials.push(newCredential)
  return newCredential
}
