/**
 * Jest setup file for backend tests
 * Configures global test environment and utilities
 */

/// <reference types="jest" />

// Extend Jest matchers - globals are available in test environment

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./test-database.sqlite'

// Mock console methods to avoid noisy test output
global.console = {
  ...console,
  // Uncomment these if you want to suppress logs in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Global test timeout
jest.setTimeout(10000)

// Mock nodemailer for email testing
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' })),
  })),
}))

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})

// Global test utilities
global.testUtils = {
  // Helper to create test user data
  createTestUser: (overrides = {}) => ({
    email: 'test@example.com',
    name: 'Test User',
    role: 'parent' as const,
    familyId: 1,
    birthdate: '1990-01-01',
    createdBy: null,
    ...overrides,
  }),

  // Helper to create test family data
  createTestFamily: (overrides = {}) => ({
    name: 'Test Family',
    primaryParentId: 1,
    ...overrides,
  }),

  // Helper to create test chore data
  createTestChore: (overrides = {}) => ({
    title: 'Test Chore',
    description: 'Test chore description',
    difficulty: 'medium' as const,
    category: 'cleaning',
    isRecurring: false,
    recurrencePattern: null,
    familyId: 1,
    ...overrides,
  }),

  // Helper to create test assignment data
  createTestAssignment: (overrides = {}) => ({
    childId: 1,
    choreId: 1,
    assignedDate: '2024-01-01',
    dueDate: '2024-01-02',
    status: 'assigned' as const,
    completedDate: null,
    pointsEarned: 5,
    notes: null,
    familyId: 1,
    ...overrides,
  }),
}

// Export module to make this file a module for global augmentation
export {}

// Declare global types for TypeScript
declare global {
  var testUtils: {
    createTestUser: (overrides?: any) => any
    createTestFamily: (overrides?: any) => any
    createTestChore: (overrides?: any) => any
    createTestAssignment: (overrides?: any) => any
  }
}
