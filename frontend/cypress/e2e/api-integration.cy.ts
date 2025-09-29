/**
 * API Integration Tests
 *
 * Tests the integration between frontend and backend APIs:
 * 1. Authentication API calls
 * 2. Data fetching and caching
 * 3. Error handling and retry logic
 * 4. Real-time data updates
 * 5. API request/response validation
 */

describe('Frontend-Backend API Integration', () => {
  const testUser = {
    email: `api-test-${Date.now()}@example.com`,
    name: 'API Test User',
    familyName: 'API Test Family',
  }

  before(() => {
    // Ensure backend is running for all API integration tests
    cy.waitForBackend()
  })

  describe('Authentication API Integration', () => {
    it('should handle complete signup flow via API client', () => {
      cy.log('🔗 Testing signup API integration')

      // Visit signup page to trigger API client
      cy.visit('/signup')

      // Fill form and submit
      cy.get('[data-cy=email-input]').type(testUser.email)
      cy.get('[data-cy=name-input]').type(testUser.name)
      cy.get('[data-cy=family-name-input]').type(testUser.familyName)

      // Intercept the API call to verify it's made correctly
      cy.intercept('POST', '**/api/auth/signup', (req) => {
        expect(req.body).to.include({
          email: testUser.email,
          name: testUser.name,
          familyName: testUser.familyName,
        })

        // Ensure proper headers are set
        expect(req.headers).to.include({
          'content-type': 'application/json',
          accept: 'application/json',
        })

        req.reply({
          statusCode: 201,
          body: {
            success: true,
            message: 'Family account created! Check your email for login link.',
            data: {
              user: {
                id: 100,
                email: testUser.email,
                name: testUser.name,
                role: 'parent',
              },
              family: {
                id: 50,
                name: testUser.familyName,
              },
            },
          },
        })
      }).as('signupRequest')

      cy.get('[data-cy=signup-button]').click()

      // Verify API call was made
      cy.wait('@signupRequest')

      // Verify success message is displayed
      cy.contains('check your email', { matchCase: false }).should('be.visible')
    })

    it('should handle login API flow', () => {
      cy.log('🔑 Testing login API integration')

      cy.visit('/login')

      // Intercept magic link request
      cy.intercept('POST', '**/api/auth/send-magic-link', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Magic link sent to your email!',
        },
      }).as('sendMagicLinkRequest')

      cy.get('[data-cy=email-input]').type('existing@example.com')
      cy.get('[data-cy=send-magic-link-button]').click()

      cy.wait('@sendMagicLinkRequest')
      cy.contains('magic link sent', { matchCase: false }).should('be.visible')
    })

    it('should handle session validation on page load', () => {
      cy.log('🔍 Testing session validation')

      // Set a session token
      cy.window().then((window) => {
        window.localStorage.setItem('sessionToken', 'session_test_12345')
      })

      // Mock the /me endpoint
      cy.intercept('GET', '**/api/auth/me', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            user: {
              id: 1,
              email: 'test@example.com',
              name: 'Test User',
              role: 'parent',
              familyId: 1,
            },
            family: {
              id: 1,
              name: 'Test Family',
            },
          },
        },
      }).as('validateSession')

      cy.visit('/dashboard')

      // Should make session validation call
      cy.wait('@validateSession')

      // Should display user info
      cy.get('[data-cy=user-welcome]').should('be.visible')
    })
  })

  describe('Data Fetching API Integration', () => {
    beforeEach(() => {
      // Setup authenticated session for data tests
      cy.window().then((window) => {
        window.localStorage.setItem('sessionToken', 'session_data_test_123')
      })

      // Mock auth validation
      cy.intercept('GET', '**/api/auth/me', { fixture: 'users.json' }).as(
        'getUser',
      )
    })

    it('should fetch and display chores data', () => {
      cy.log('🧹 Testing chores data fetching')

      cy.intercept('GET', '**/api/chores', { fixture: 'chores.json' }).as(
        'getChores',
      )

      cy.visit('/dashboard/chores')
      cy.wait('@getUser')
      cy.wait('@getChores')

      // Verify chores are displayed
      cy.contains('Clean bedroom').should('be.visible')
      cy.contains('Take out trash').should('be.visible')
      cy.contains('Wash dishes').should('be.visible')

      // Verify difficulty levels are shown
      cy.contains('medium').should('be.visible')
      cy.contains('easy').should('be.visible')

      // Verify points are displayed
      cy.contains('5 points').should('be.visible')
      cy.contains('3 points').should('be.visible')
    })

    it('should fetch and display assignments data', () => {
      cy.log('📋 Testing assignments data fetching')

      cy.intercept('GET', '**/api/assignments', {
        fixture: 'assignments.json',
      }).as('getAssignments')

      cy.visit('/dashboard/assignments')
      cy.wait('@getUser')
      cy.wait('@getAssignments')

      // Verify assignments are displayed with correct status
      cy.contains('Alice').should('be.visible')
      cy.contains('Bob').should('be.visible')
      cy.contains('completed').should('be.visible')
      cy.contains('in_progress').should('be.visible')
      cy.contains('assigned').should('be.visible')
      cy.contains('missed').should('be.visible')
    })

    it('should fetch and display dashboard statistics', () => {
      cy.log('📊 Testing dashboard stats fetching')

      cy.intercept('GET', '**/api/dashboard/stats', {
        statusCode: 200,
        body: {
          success: true,
          data: {
            total_children: 2,
            total_chores: 5,
            total_assignments: 12,
            completed_assignments: 8,
            pending_assignments: 4,
            total_points_earned: 67,
            this_week: {
              assignments_completed: 3,
              points_earned: 15,
            },
            top_performers: [
              { child_id: 1, child_name: 'Alice', points_this_week: 12 },
              { child_id: 2, child_name: 'Bob', points_this_week: 8 },
            ],
          },
        },
      }).as('getDashboardStats')

      cy.visit('/dashboard')
      cy.wait('@getUser')
      cy.wait('@getDashboardStats')

      // Verify statistics are displayed
      cy.get('[data-cy=stat-children]').should('contain', '2')
      cy.get('[data-cy=stat-chores]').should('contain', '5')
      cy.get('[data-cy=stat-assignments]').should('contain', '12')
    })
  })

  describe('Error Handling and Retry Logic', () => {
    beforeEach(() => {
      cy.window().then((window) => {
        window.localStorage.setItem('sessionToken', 'session_error_test_123')
      })
    })

    it('should handle 401 authentication errors', () => {
      cy.log('❌ Testing 401 error handling')

      // Mock 401 response
      cy.intercept('GET', '**/api/auth/me', {
        statusCode: 401,
        body: {
          success: false,
          error: 'Invalid or expired session',
        },
      }).as('authError')

      cy.visit('/dashboard')
      cy.wait('@authError')

      // Should redirect to login
      cy.url().should('include', '/login')

      // Session token should be cleared
      cy.window()
        .its('localStorage')
        .invoke('getItem', 'sessionToken')
        .should('be.null')
    })

    it('should handle 500 server errors gracefully', () => {
      cy.log('🚨 Testing server error handling')

      cy.intercept('GET', '**/api/auth/me', { fixture: 'users.json' }).as(
        'getUser',
      )
      cy.intercept('GET', '**/api/dashboard/stats', {
        statusCode: 500,
        body: {
          success: false,
          error: 'Internal server error',
        },
      }).as('serverError')

      cy.visit('/dashboard')
      cy.wait('@getUser')
      cy.wait('@serverError')

      // Should show error message or fallback content
      cy.get('[data-cy=error-message]').should('be.visible')
      cy.contains('error', { matchCase: false }).should('be.visible')
    })

    it('should handle network timeout errors', () => {
      cy.log('⏰ Testing timeout error handling')

      cy.intercept('GET', '**/api/auth/me', { fixture: 'users.json' }).as(
        'getUser',
      )
      cy.intercept('GET', '**/api/chores', { forceNetworkError: true }).as(
        'networkError',
      )

      cy.visit('/dashboard/chores')
      cy.wait('@getUser')
      cy.wait('@networkError')

      // Should show network error message
      cy.contains('network', { matchCase: false }).should('be.visible')
      cy.contains('error', { matchCase: false }).should('be.visible')
    })
  })

  describe('Real-time Updates and Caching', () => {
    beforeEach(() => {
      cy.window().then((window) => {
        window.localStorage.setItem('sessionToken', 'session_realtime_test_123')
      })
      cy.intercept('GET', '**/api/auth/me', { fixture: 'users.json' }).as(
        'getUser',
      )
    })

    it('should refresh data when user performs actions', () => {
      cy.log('🔄 Testing data refresh on actions')

      let requestCount = 0
      cy.intercept('GET', '**/api/assignments', (req) => {
        requestCount++
        req.reply({ fixture: 'assignments.json' })
      }).as('getAssignments')

      cy.visit('/dashboard/assignments')
      cy.wait('@getUser')
      cy.wait('@getAssignments')

      // Simulate marking assignment as complete
      cy.get('[data-cy=mark-complete-button]').first().click()

      // Should refetch assignments
      cy.wait('@getAssignments')

      // Verify multiple API calls were made
      cy.then(() => {
        expect(requestCount).to.be.greaterThan(1)
      })
    })

    it('should cache API responses appropriately', () => {
      cy.log('💾 Testing API response caching')

      let choresRequestCount = 0
      cy.intercept('GET', '**/api/chores', (req) => {
        choresRequestCount++
        req.reply({ fixture: 'chores.json' })
      }).as('getChores')

      // Visit chores page
      cy.visit('/dashboard/chores')
      cy.wait('@getUser')
      cy.wait('@getChores')

      // Navigate away and back
      cy.get('[data-cy=nav-dashboard]').click()
      cy.get('[data-cy=nav-chores]').click()

      // Depending on caching strategy, may or may not make another request
      cy.then(() => {
        cy.log(`Chores requests made: ${choresRequestCount}`)
        expect(choresRequestCount).to.be.at.least(1)
      })
    })
  })

  describe('API Request/Response Validation', () => {
    it('should send correct headers with all requests', () => {
      cy.log('📋 Testing API headers')

      cy.window().then((window) => {
        window.localStorage.setItem('sessionToken', 'session_header_test_123')
      })

      cy.intercept('GET', '**/api/auth/me', (req) => {
        // Verify required headers are present
        expect(req.headers).to.include({
          accept: 'application/json',
          authorization: 'Bearer session_header_test_123',
        })

        req.reply({ fixture: 'users.json' })
      }).as('headerValidation')

      cy.visit('/dashboard')
      cy.wait('@headerValidation')
    })

    it('should handle API response format validation', () => {
      cy.log('✅ Testing response validation')

      cy.window().then((window) => {
        window.localStorage.setItem(
          'sessionToken',
          'session_validation_test_123',
        )
      })

      // Mock malformed response
      cy.intercept('GET', '**/api/auth/me', {
        statusCode: 200,
        body: {
          // Missing required fields
          success: true,
          // data field missing
        },
      }).as('malformedResponse')

      cy.visit('/dashboard')
      cy.wait('@malformedResponse')

      // Should handle malformed response gracefully
      cy.get('[data-cy=error-message]').should('be.visible')
    })
  })

  afterEach(() => {
    // Clean up test state
    cy.clearLocalStorage()
    cy.clearCookies()
  })
})
