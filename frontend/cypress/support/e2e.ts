// Import Cypress commands
import './commands'

// Global configuration for all E2E tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on certain uncaught exceptions
  // This is useful for third-party libraries that might throw non-critical errors
  console.warn('Uncaught exception:', err.message)

  // Return false to prevent the test from failing
  // Only do this for known non-critical errors
  if (
    err.message.includes('Script error') ||
    err.message.includes('Non-Error promise rejection')
  ) {
    return false
  }

  // For other errors, let Cypress handle them normally
  return true
})

// Custom assertions and global test configuration
beforeEach(() => {
  // Clear any previous auth state
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Add custom matchers or global test utilities here
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with magic link simulation
       * @param email - User email to login with
       */
      loginWithMagicLink(email: string): Chainable<any>

      /**
       * Custom command to wait for backend server
       */
      waitForBackend(): Chainable<any>

      /**
       * Custom command to create test user via API
       */
      createTestUser(userData: {
        email: string
        name: string
        familyName: string
      }): Chainable<any>

      /**
       * Custom command to get magic token from database
       */
      getMagicToken(email: string): Chainable<string>
    }
  }
}
