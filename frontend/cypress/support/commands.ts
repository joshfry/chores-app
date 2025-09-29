// Custom Cypress commands for the Chores app

/**
 * Wait for backend server to be available
 */
Cypress.Commands.add('waitForBackend', () => {
  const backendUrl = Cypress.env('BACKEND_URL')

  cy.request({
    method: 'GET',
    url: `${backendUrl}/health`,
    headers: {
      Accept: 'application/json',
    },
    timeout: 10000,
    retryOnStatusCodeFailure: true,
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body.success).to.eq(true)
  })
})

/**
 * Create a test user via the backend API
 */
Cypress.Commands.add(
  'createTestUser',
  (userData: { email: string; name: string; familyName: string }) => {
    const backendUrl = Cypress.env('BACKEND_URL')

    return cy
      .request({
        method: 'POST',
        url: `${backendUrl}/api/auth/signup`,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: userData,
        failOnStatusCode: false, // Allow 409 conflicts for existing users
      })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          cy.log('✅ Test user created or already exists via API')
          return response.body
        }

        if (response.status === 409) {
          cy.log('ℹ️ User already exists, continuing...')
          return { success: true, existed: true }
        }

        throw new Error(
          `Failed to create user: ${response.status} ${response.body?.error}`,
        )
      })
      .then(() => {
        // Ensure the user exists before proceeding by fetching from test endpoint
        return cy.request({
          method: 'GET',
          url: `${backendUrl}/api/test/latest-user?email=${encodeURIComponent(
            userData.email,
          )}`,
          headers: {
            Accept: 'application/json',
          },
        })
      })
      .then((response) => {
        expect(response.status).to.eq(200)
        const { user } = response.body.data || {}
        if (!user) {
          throw new Error('Failed to confirm user creation via test endpoint')
        }
        return response.body
      })
  },
)

/**
 * Get magic token for a user (simulates checking server logs/email)
 */
Cypress.Commands.add('getMagicToken', (email: string) => {
  const backendUrl = Cypress.env('BACKEND_URL')

  return cy
    .request({
      method: 'POST',
      url: `${backendUrl}/api/auth/send-magic-link`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: { email },
    })
    .then((response) => {
      expect(response.status).to.eq(200)

      return cy.request({
        method: 'GET',
        url: `${backendUrl}/api/test/magic-tokens/latest?email=${encodeURIComponent(
          email,
        )}`,
        headers: { Accept: 'application/json' },
      })
    })
    .then((response) => {
      expect(response.status).to.eq(200)
      const { token } = response.body.data || {}
      if (!token) {
        throw new Error('Failed to retrieve magic token from testing endpoint')
      }
      return token as string
    })
})

/**
 * Complete login flow with magic link simulation
 */
Cypress.Commands.add('loginWithMagicLink', (email: string) => {
  cy.log(`🔐 Starting magic link login for: ${email}`)

  // Step 1: Ensure backend is ready
  cy.waitForBackend()

  // Step 2: Visit the login page
  cy.visit('/login')

  // Step 3: Enter email and request magic link
  cy.get('[data-testid=email-input]').should('be.visible').type(email)
  cy.get('[data-testid=send-magic-link-button]').click()

  // Step 4: Wait for success message
  cy.contains('magic link sent', { matchCase: false }).should('be.visible')

  // Step 5: In a real app, user would click email link
  // For testing, we'll simulate the verification directly
  cy.getMagicToken(email).then((token) => {
    // Navigate directly to verify page with token
    cy.visit(`/verify?token=${token}`)

    // Should redirect to dashboard after successful verification
    cy.url({ timeout: 10000 }).should('include', '/dashboard')

    // Verify user is logged in by checking for user-specific content
    cy.get('[data-testid=user-welcome]', { timeout: 5000 }).should('be.visible')
  })
})

// Additional utility commands for testing specific functionality

/**
 * Check that user is on a protected route and authenticated
 */
Cypress.Commands.add('verifyAuthenticated', () => {
  // Check that session token exists in localStorage
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'sessionToken')
    .should('exist')

  // Check that we can access a protected API endpoint
  cy.window().then((window) => {
    const token = window.localStorage.getItem('sessionToken')
    const backendUrl = Cypress.env('BACKEND_URL')

    cy.request({
      method: 'GET',
      url: `${backendUrl}/api/auth/me`,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.success).to.eq(true)
    })
  })
})

// TypeScript declaration for the new commands
declare global {
  namespace Cypress {
    interface Chainable {
      verifyAuthenticated(): Chainable<any>
    }
  }
}
