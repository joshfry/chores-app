# 🧪 Cypress E2E Testing Suite

Comprehensive end-to-end testing for the Family Chores Management App using Cypress.

## 🚀 Quick Start

### Prerequisites

1. **Backend server** running on `http://localhost:3001`
2. **Frontend server** running on `http://localhost:3000`
3. **Database** populated with test data

### Running Tests

```bash
# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run all tests headlessly (CI mode)
npm run cypress:run

# Run tests with automatic server startup
npm run test:e2e

# Open tests with automatic server startup
npm run test:e2e:open
```

## 📁 Test Structure

```
cypress/
├── e2e/                    # End-to-end test specifications
│   ├── auth-flow.cy.ts     # Authentication flow tests
│   ├── dashboard-navigation.cy.ts  # Dashboard and navigation tests
│   └── api-integration.cy.ts       # API integration tests
├── fixtures/               # Test data and mocks
│   ├── users.json          # User data fixtures
│   ├── chores.json         # Chores data fixtures
│   └── assignments.json    # Assignment data fixtures
├── support/                # Support files and custom commands
│   ├── e2e.ts              # E2E test configuration
│   ├── commands.ts         # Custom Cypress commands
│   └── component.ts        # Component test support
└── README.md               # This file
```

## 🧪 Test Coverage

### 1. Authentication Flow Tests (`auth-flow.cy.ts`)

**User Signup Flow:**

- ✅ New user family account creation
- ✅ Duplicate email prevention
- ✅ Form validation

**Magic Link Verification:**

- ✅ Valid token verification and session creation
- ✅ Invalid/expired token rejection
- ✅ Single-use token enforcement

**Existing User Login:**

- ✅ Magic link request for existing users
- ✅ Non-existent user error handling

**Session Management:**

- ✅ Protected route access with valid session
- ✅ Redirect to login without authentication
- ✅ Logout and session cleanup

### 2. Dashboard Navigation Tests (`dashboard-navigation.cy.ts`)

**Dashboard Loading:**

- ✅ User information display
- ✅ Navigation menu presence
- ✅ Family statistics loading

**Section Navigation:**

- ✅ Users section with family members
- ✅ Chores section with chore management
- ✅ Assignments section with status tracking

**Data Display:**

- ✅ Family statistics cards
- ✅ Weekly performance metrics
- ✅ Leaderboard with top performers

**Responsive Design:**

- ✅ Mobile viewport compatibility
- ✅ Keyboard accessibility
- ✅ Error state handling

### 3. API Integration Tests (`api-integration.cy.ts`)

**Authentication API:**

- ✅ Signup API request/response validation
- ✅ Magic link API integration
- ✅ Session validation on page load

**Data Fetching:**

- ✅ Chores API integration
- ✅ Assignments API integration
- ✅ Dashboard statistics API

**Error Handling:**

- ✅ 401 authentication errors
- ✅ 500 server errors
- ✅ Network timeout handling

**Performance:**

- ✅ Data refresh on user actions
- ✅ API response caching
- ✅ Request header validation

## 🎛️ Custom Commands

The test suite includes several custom Cypress commands for common operations:

### Authentication Commands

```typescript
// Wait for backend server to be available
cy.waitForBackend()

// Create test user via API
cy.createTestUser({
  email: 'test@example.com',
  name: 'Test User',
  familyName: 'Test Family',
})

// Complete magic link login flow
cy.loginWithMagicLink('user@example.com')

// Verify user is authenticated
cy.verifyAuthenticated()
```

### Utility Commands

```typescript
// Get magic token (simulates email access)
cy.getMagicToken('user@example.com')

// Make direct API calls in tests
cy.task('makeApiCall', {
  method: 'GET',
  url: 'http://localhost:3001/api/users',
  headers: { Accept: 'application/json' },
})
```

## 🔧 Configuration

### Environment Variables

The test suite uses these environment variables (configured in `cypress.config.ts`):

```typescript
env: {
  BACKEND_URL: 'http://localhost:3001',  // Backend API base URL
  TEST_EMAIL: 'cypress-test@example.com', // Default test email
  TEST_NAME: 'Cypress Test User',         // Default test name
  TEST_FAMILY: 'Cypress Test Family',     // Default family name
}
```

### Test Data Attributes

Tests rely on `data-cy` attributes in React components:

```jsx
// Example component with test attributes
<button data-cy="login-button">Login</button>
<input data-cy="email-input" type="email" />
<div data-cy="user-welcome">Welcome, {user.name}!</div>
```

## 🚨 Test Requirements

### Backend Requirements

1. **Server Running**: Backend must be available at `http://localhost:3001`
2. **Database Access**: Tests may create and clean up test data
3. **API Endpoints**: All API endpoints must be functional
4. **CORS Configuration**: Frontend requests must be allowed

### Frontend Requirements

1. **Server Running**: Frontend must be available at `http://localhost:3000`
2. **Test Attributes**: Components must include `data-cy` attributes
3. **Error Boundaries**: Proper error handling for failed API calls
4. **Authentication**: Proper session management and protected routes

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci
          cd ../frontend && npm ci

      - name: Start backend
        run: |
          cd backend && npm start &
          sleep 10

      - name: Run Cypress tests
        run: cd frontend && npm run test:e2e:ci
```

## 🧼 Test Cleanup

Tests automatically clean up after themselves by:

- Clearing `localStorage` and cookies
- Removing test users created during runs
- Resetting application state between tests

## 🐛 Debugging Tests

### Common Issues

1. **Server not running**: Ensure both backend and frontend servers are started
2. **Database state**: Tests may fail if database is in unexpected state
3. **Network timeouts**: Increase timeout values in `cypress.config.ts`
4. **Element not found**: Verify `data-cy` attributes are present in components

### Debug Commands

```bash
# Run specific test file
npx cypress run --spec "cypress/e2e/auth-flow.cy.ts"

# Run tests in specific browser
npx cypress run --browser chrome

# Enable debug mode
DEBUG=cypress:* npm run cypress:run
```

## 📊 Test Reports

Cypress generates test reports and artifacts:

- **Screenshots**: Saved on test failures
- **Videos**: Recorded for all test runs (can be disabled)
- **Test Results**: JUnit XML format for CI integration
- **Coverage Reports**: When integrated with code coverage tools

## 🤝 Contributing

When adding new tests:

1. **Follow naming conventions**: `feature-name.cy.ts`
2. **Use custom commands**: Leverage existing helpers
3. **Add test attributes**: Include `data-cy` in new components
4. **Update fixtures**: Add new test data as needed
5. **Document changes**: Update this README for new test coverage

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library Integration](https://testing-library.com/docs/cypress-testing-library/intro)
