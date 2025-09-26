/**
 * Authentication Data Models
 * Defines data structures for users, families, and authentication
 */

// Mock data for development
let users = [
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

let families = [
  {
    id: 1,
    name: 'Johnson Family',
    created_date: '2024-09-01',
    primary_parent_id: 1,
  },
]

let magicTokens = [
  {
    id: 1,
    user_id: 2,
    token: 'magic_token_abc123',
    expires_at: '2024-09-26T23:59:59Z',
    used: false,
  },
]

let webauthnCredentials = [
  {
    id: 1,
    user_id: 1,
    credential_id: 'credential_123',
    public_key: 'public_key_data_here',
    device_name: 'iPhone 15 Pro',
  },
]

// Helper functions for mock data manipulation
const authModels = {
  // Users
  getAllUsers: () => users,
  getUserById: (id) => users.find((user) => user.id === parseInt(id)),
  getUserByEmail: (email) => users.find((user) => user.email === email),
  createUser: (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      last_login: null,
      is_active: true,
    }
    users.push(newUser)
    return newUser
  },
  updateUser: (id, updates) => {
    const userIndex = users.findIndex((user) => user.id === parseInt(id))
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      return users[userIndex]
    }
    return null
  },

  // Families
  getAllFamilies: () => families,
  getFamilyById: (id) => families.find((family) => family.id === parseInt(id)),
  createFamily: (familyData) => {
    const newFamily = {
      id: families.length + 1,
      ...familyData,
      created_date: new Date().toISOString().split('T')[0],
    }
    families.push(newFamily)
    return newFamily
  },

  // Magic Tokens
  createMagicToken: (userId) => {
    const token = {
      id: magicTokens.length + 1,
      user_id: userId,
      token: `magic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      used: false,
    }
    magicTokens.push(token)
    return token
  },
  getMagicToken: (token) =>
    magicTokens.find((t) => t.token === token && !t.used),
  useMagicToken: (token) => {
    const tokenIndex = magicTokens.findIndex((t) => t.token === token)
    if (tokenIndex !== -1) {
      magicTokens[tokenIndex].used = true
      return true
    }
    return false
  },

  // WebAuthn Credentials
  getCredentialsByUserId: (userId) =>
    webauthnCredentials.filter((cred) => cred.user_id === parseInt(userId)),
  createCredential: (credentialData) => {
    const newCredential = {
      id: webauthnCredentials.length + 1,
      ...credentialData,
    }
    webauthnCredentials.push(newCredential)
    return newCredential
  },
}

module.exports = authModels
