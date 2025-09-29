/**
 * End-to-End Authentication Flow Tests
 *
 * Tests the complete passwordless authentication journey:
 * 1. User signup with family creation
 * 2. Magic link generation and email simulation
 * 3. Token verification and session creation
 * 4. Protected route access
 * 5. Logout and session cleanup
 */

describe('Authentication Flow', () => {
  const testUser = {
    email: `cypress-${Date.now()}@example.com`,
    name: 'Cypress Test User',
    familyName: 'Cypress Test Family',
    birthdate: '1990-05-15',
  }

  beforeEach(() => {
    // Ensure backend is running before each test
    cy.waitForBackend()
  })

  describe('User Signup Flow', () => {
    it('should allow new user to create family account', () => {
      cy.log('🚀 Testing user signup flow')

      // Visit signup page
      cy.visit('/signup')

      // Verify signup form is present
      cy.get('[data-testid=signup-form]').should('be.visible')
      cy.get('[data-testid=signup-email]').should('be.visible')
      cy.get('[data-testid=signup-name]').should('be.visible')
      cy.get('[data-testid=signup-family-name]').should('be.visible')

      // Fill out signup form
      cy.get('[data-testid=signup-email]').type(testUser.email)
      cy.get('[data-testid=signup-name]').type(testUser.name)
      cy.get('[data-testid=signup-family-name]').type(testUser.familyName)

      // Submit signup form
      cy.get('[data-testid=signup-submit]').click()

      // Should show success message about magic link
      cy.contains('check your email', { matchCase: false }).should('be.visible')
      cy.contains('magic link', { matchCase: false }).should('be.visible')

      // Should redirect to verification waiting page or login
      cy.url().should(
        'satisfy',
        (url: string) => url.includes('/login') || url.includes('/verify'),
      )
    })

    it('should prevent duplicate email registration', () => {
      cy.log('🔒 Testing duplicate email prevention')

      // First, create a user via API
      cy.createTestUser({
        email: 'duplicate@example.com',
        name: 'Duplicate User',
        familyName: 'Duplicate Family',
      })

      // Try to signup with same email via UI
      cy.visit('/signup')
      cy.get('[data-testid=signup-email]').type('duplicate@example.com')
      cy.get('[data-testid=signup-name]').type('Another User')
      cy.get('[data-testid=signup-family-name]').type('Another Family')
      cy.get('[data-testid=signup-submit]').click()

      // Should show error message
      cy.contains('email already exists', { matchCase: false }).should(
        'be.visible',
      )
    })
  })

  describe('Magic Link Verification Flow', () => {
    it('should successfully verify magic token and create session', () => {
      cy.log('🔗 Testing magic link verification')

      // Create test user first
      cy.createTestUser(testUser)

      // Simulate clicking magic link by going directly to verify page
      // In real flow, this would come from email link
      // Request magic link and fetch actual token
      cy.getMagicToken(testUser.email).then((token: string) => {
        // Visit verification URL
        cy.visit(`/verify?token=${token}`)

        // Should redirect to dashboard after successful verification
        cy.url({ timeout: 15000 }).should('include', '/dashboard')

        // Verify user is logged in
        cy.get('[data-testid=dashboard]').should('be.visible')
        cy.get('[data-testid=user-welcome]').should('be.visible')
      })
    })

    it('should reject invalid magic tokens', () => {
      cy.log('❌ Testing invalid token rejection')

      // Try to verify with invalid token
      cy.visit('/verify?token=invalid_token_12345')

      // Should show error message
      cy.contains('invalid', { matchCase: false }).should('be.visible')
      cy.contains('expired', { matchCase: false }).should('be.visible')

      // Should show button to go back to login
      cy.contains('Back to Login').click()
      cy.url().should('include', '/login')
    })
  })

  describe('Login Flow for Existing Users', () => {
    it('should allow existing user to request new magic link', () => {
      cy.log('🔑 Testing existing user login')

      // Ensure user exists
      cy.createTestUser(testUser)

      // Visit login page
      cy.visit('/login')

      // Enter email and request magic link
      cy.get('[data-testid=login-email]').type(testUser.email)
      cy.get('[data-testid=login-submit]').click()

      // Should show success message
      cy.contains('magic link sent', { matchCase: false }).should('be.visible')
    })

    it('should show error for non-existent user email', () => {
      cy.log('❌ Testing non-existent user login')

      cy.visit('/login')
      cy.get('[data-testid=login-email]').type('nonexistent@example.com')
      cy.get('[data-testid=login-submit]').click()

      // Should show error
      cy.contains('user not found', { matchCase: false }).should('be.visible')
    })
  })

  describe('Protected Routes and Session Management', () => {
    beforeEach(() => {
      // Create and login user for these tests
      cy.createTestUser(testUser)
      // For now, we'll manually set a session token
      // In full implementation, would use the magic link flow
      cy.window().then((window) => {
        window.localStorage.setItem('sessionToken', 'session_test_token_123')
      })
    })

    it('should allow access to dashboard when authenticated', () => {
      cy.log('✅ Testing protected route access')

      cy.visit('/dashboard')

      // Should load dashboard content
      cy.get('[data-testid=dashboard]').should('be.visible')
      cy.get('[data-testid=user-welcome]').should('be.visible')
    })

    it('should redirect to login when accessing protected routes without auth', () => {
      cy.log('🚫 Testing protected route blocking')

      // Clear authentication
      cy.clearLocalStorage()

      // Try to access protected route
      cy.visit('/dashboard')

      // Should redirect to login
      cy.url().should('include', '/login')
      cy.contains('login', { matchCase: false }).should('be.visible')
    })

    it('should handle logout correctly', () => {
      cy.log('👋 Testing logout flow')

      cy.visit('/dashboard')

      // Click logout button
      cy.get('[data-testid=logout-button]').click()

      // Should redirect to login
      cy.url().should('include', '/login')

      // Session token should be cleared
      cy.window()
        .its('localStorage')
        .invoke('getItem', 'sessionToken')
        .should('be.null')
    })
  })

  describe('API Integration Tests', () => {
    beforeEach(() => {
      // Setup authenticated session
      cy.createTestUser(testUser)
      cy.window().then((window) => {
        window.localStorage.setItem('sessionToken', 'session_test_token_123')
      })
    })

    it('should load user data from backend API', () => {
      cy.log('📊 Testing API data loading')

      cy.visit('/dashboard')

      // Should load and display user information
      cy.get('[data-testid=user-name]').should('contain.text', testUser.name)
      cy.get('[data-testid=family-name]').should(
        'contain.text',
        testUser.familyName,
      )
    })

    it('should handle API errors gracefully', () => {
      cy.log('⚠️ Testing API error handling')

      // Set invalid session token
      cy.window().then((window) => {
        window.localStorage.setItem('sessionToken', 'invalid_session_token')
      })

      cy.visit('/dashboard')

      // Should handle error and redirect or show error message
      cy.url({ timeout: 5000 }).should(
        'satisfy',
        (url: string) => url.includes('/login') || url.includes('/error'),
      )
    })
  })

  after(() => {
    // Cleanup: Clear any test data
    cy.clearLocalStorage()
    cy.clearCookies()
  })
})
