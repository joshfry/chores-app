/**
 * Dashboard Navigation and Functionality Tests
 *
 * Tests the main dashboard features and navigation:
 * 1. Dashboard page loading and data display
 * 2. Navigation between different sections
 * 3. User management features
 * 4. Chores and assignments display
 * 5. Family statistics and leaderboards
 */

describe('Dashboard Navigation and Features', () => {
  const testUser = {
    email: 'dashboard-test@example.com',
    name: 'Dashboard Test User',
    familyName: 'Dashboard Test Family',
  }

  beforeEach(() => {
    // Ensure backend is running
    cy.waitForBackend()

    // Create test user and simulate authentication
    cy.createTestUser(testUser)

    // Mock authentication - in real implementation this would come from login flow
    cy.window().then((window) => {
      // Set a mock session token for testing
      window.localStorage.setItem('sessionToken', 'session_dashboard_test_123')
    })

    // Mock API responses for consistent testing
    cy.intercept('GET', '**/api/auth/me', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            id: 1,
            email: testUser.email,
            name: testUser.name,
            role: 'parent',
            familyId: 1,
            totalPoints: null,
          },
          family: {
            id: 1,
            name: testUser.familyName,
            createdDate: '2024-01-01T00:00:00Z',
          },
        },
      },
    }).as('getCurrentUser')
  })

  describe('Dashboard Page Loading', () => {
    it('should load dashboard with user information', () => {
      cy.log('📊 Testing dashboard loading')

      cy.visit('/dashboard')

      // Wait for API call to complete
      cy.wait('@getCurrentUser')

      // Verify dashboard components are present
      cy.get('[data-testid=dashboard]').should('be.visible')
      cy.get('[data-testid=user-welcome]').should('be.visible')
      cy.get('[data-testid=user-name]').should('contain.text', testUser.name)
      cy.get('[data-testid=family-name]').should(
        'contain.text',
        testUser.familyName,
      )
    })

    it('should display navigation menu', () => {
      cy.log('🧭 Testing navigation menu')

      cy.visit('/dashboard')
      cy.wait('@getCurrentUser')

      // Check navigation links are present
      cy.get('[data-testid=nav-dashboard]')
        .should('be.visible')
        .should('contain.text', 'Dashboard')
      cy.get('[data-testid=nav-users]')
        .should('be.visible')
        .should('contain.text', 'Users')
      cy.get('[data-testid=nav-chores]')
        .should('be.visible')
        .should('contain.text', 'Chores')
      cy.get('[data-testid=nav-assignments]')
        .should('be.visible')
        .should('contain.text', 'Assignments')

      // Check logout button
      cy.get('[data-testid=logout-button]').should('be.visible')
    })
  })

  describe('Navigation Between Sections', () => {
    beforeEach(() => {
      cy.visit('/dashboard')
      cy.wait('@getCurrentUser')
    })

    it('should navigate to Users section', () => {
      cy.log('👥 Testing Users navigation')

      // Mock users API response
      cy.intercept('GET', '**/api/auth/users', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 1,
              email: testUser.email,
              name: testUser.name,
              role: 'parent',
              birthdate: '1990-05-15',
            },
            {
              id: 2,
              email: 'child@example.com',
              name: 'Test Child',
              role: 'child',
              birthdate: '2015-03-15',
            },
          ],
        },
      }).as('getUsers')

      cy.get('[data-testid=nav-users]').click()
      cy.url().should('include', '/dashboard/users')

      // Verify users page content
      cy.get('[data-testid=users-page]').should('be.visible')
      cy.get('[data-testid=add-child-button]').should('be.visible')
    })

    it('should navigate to Chores section', () => {
      cy.log('🧹 Testing Chores navigation')

      // Mock chores API response
      cy.intercept('GET', '**/api/chores', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 1,
              title: 'Clean bedroom',
              description: 'Make bed, organize toys, vacuum floor',
              points: 5,
              difficulty: 'medium',
              category: 'cleaning',
            },
            {
              id: 2,
              title: 'Take out trash',
              description: 'Empty all trash cans and take to curb',
              points: 3,
              difficulty: 'easy',
              category: 'cleaning',
            },
          ],
        },
      }).as('getChores')

      cy.get('[data-testid=nav-chores]').click()
      cy.url().should('include', '/dashboard/chores')

      cy.wait('@getChores')
      cy.get('[data-testid=chores-page]').should('be.visible')
      cy.get('[data-testid=add-chore-button]').should('be.visible')

      // Verify chore items are displayed
      cy.contains('Clean bedroom').should('be.visible')
      cy.contains('Take out trash').should('be.visible')
    })

    it('should navigate to Assignments section', () => {
      cy.log('📋 Testing Assignments navigation')

      // Mock assignments API response
      cy.intercept('GET', '**/api/assignments', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: 1,
              child_name: 'Test Child',
              chore_title: 'Clean bedroom',
              assigned_date: '2024-01-15',
              due_date: '2024-01-16',
              status: 'completed',
              points_earned: 5,
            },
            {
              id: 2,
              child_name: 'Test Child',
              chore_title: 'Take out trash',
              assigned_date: '2024-01-16',
              due_date: '2024-01-17',
              status: 'in_progress',
              points_earned: 3,
            },
          ],
        },
      }).as('getAssignments')

      cy.get('[data-testid=nav-assignments]').click()
      cy.url().should('include', '/dashboard/assignments')

      cy.wait('@getAssignments')
      cy.get('[data-testid=assignments-page]').should('be.visible')
      cy.get('[data-testid=create-assignment-button]').should('be.visible')

      // Verify assignment items are displayed
      cy.contains('Clean bedroom').should('be.visible')
      cy.contains('Take out trash').should('be.visible')
      cy.contains('completed').should('be.visible')
      cy.contains('in_progress').should('be.visible')
    })
  })

  describe('Dashboard Statistics Display', () => {
    beforeEach(() => {
      // Mock dashboard stats API
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
      cy.wait('@getCurrentUser')
      cy.wait('@getDashboardStats')
    })

    it('should display family statistics', () => {
      cy.log('📊 Testing dashboard statistics')

      // Check statistics cards are present and contain expected data
      cy.get('[data-testid=stat-children]').should('contain', '2')
      cy.get('[data-testid=stat-chores]').should('contain', '5')
      cy.get('[data-testid=stat-assignments]').should('contain', '12')
      cy.get('[data-testid=stat-completed]').should('contain', '8')
      cy.get('[data-testid=stat-points]').should('contain', '67')
    })

    it('should display weekly statistics', () => {
      cy.log('📅 Testing weekly stats')

      cy.get('[data-testid=weekly-stats]').should('be.visible')
      cy.get('[data-testid=weekly-completed]').should('contain', '3')
      cy.get('[data-testid=weekly-points]').should('contain', '15')
    })

    it('should display leaderboard', () => {
      cy.log('🏆 Testing leaderboard')

      cy.get('[data-testid=leaderboard]').should('be.visible')
      cy.get('[data-testid=top-performer]').should('have.length.at.least', 2)

      // Check that Alice is shown as top performer
      cy.contains('Alice').should('be.visible')
      cy.contains('12').should('be.visible')

      // Check that Bob is shown
      cy.contains('Bob').should('be.visible')
      cy.contains('8').should('be.visible')
    })
  })

  describe('Responsive Design and Accessibility', () => {
    it('should work on mobile devices', () => {
      cy.log('📱 Testing mobile responsiveness')

      // Set mobile viewport
      cy.viewport('iphone-x')

      cy.visit('/dashboard')
      cy.wait('@getCurrentUser')

      // Navigation should be accessible (hamburger menu or mobile nav)
      cy.get('[data-testid=mobile-nav-toggle]').should('be.visible').click()
      cy.get('[data-testid=nav-users]').should('be.visible')
    })

    it('should be accessible with keyboard navigation', () => {
      cy.log('⌨️ Testing keyboard accessibility')

      cy.visit('/dashboard')
      cy.wait('@getCurrentUser')

      // Test tab navigation
      cy.get('body').tab()
      cy.focused()
        .should('have.attr', 'data-cy')
        .and('match', /nav-|logout-|dashboard-/)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.log('⚠️ Testing error handling')

      // Mock API error
      cy.intercept('GET', '**/api/dashboard/stats', {
        statusCode: 500,
        body: { success: false, error: 'Internal server error' },
      }).as('getStatsError')

      cy.visit('/dashboard')
      cy.wait('@getCurrentUser')
      cy.wait('@getStatsError')

      // Should show error message or fallback content
      cy.get('[data-testid=error-message]').should('be.visible')
      cy.contains('error', { matchCase: false }).should('be.visible')
    })
  })

  afterEach(() => {
    // Clean up any test state
    cy.clearLocalStorage()
  })
})
