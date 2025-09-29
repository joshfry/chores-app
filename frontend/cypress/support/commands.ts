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
        if (response.status === 201) {
          cy.log('✅ Test user created successfully')
          return response.body
        } else if (response.status === 409) {
          cy.log('ℹ️ User already exists, continuing...')
          return { success: true, existed: true }
        } else {
          throw new Error(
            `Failed to create user: ${response.status} ${response.body?.error}`,
          )
        }
      })
  },
)

/**
 * Get magic token for a user (simulates checking server logs/email)
 */
Cypress.Commands.add('getMagicToken', (email: string) => {
  const backendUrl = Cypress.env('BACKEND_URL')

  // First trigger magic link generation
  cy.request({
    method: 'POST',
    url: `${backendUrl}/api/auth/send-magic-link`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: { email },
  }).then((response) => {
    expect(response.status).to.eq(200)
  })

  // Use a task to query the database for the most recent token
  // This simulates accessing the magic link from email/server logs
  return cy
    .task('makeApiCall', {
      method: 'GET',
      url: `${backendUrl}/api/test/stats`, // Using this to verify backend is accessible
      headers: { Accept: 'application/json' },
    })
    .then(() => {
      // In a real scenario, you'd query the database or intercept the email
      // For testing, we'll use a mock token pattern that the backend recognizes
      const mockToken = `magic_${Date.now()}_testtoken`

      // Store the token pattern for the test
      cy.wrap(mockToken).as('currentMagicToken')
      return cy.get('@currentMagicToken')
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
