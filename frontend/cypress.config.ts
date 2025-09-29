import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,

    // Test files configuration
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',

    // Setup and teardown
    setupNodeEvents(on, config) {
      // Implement custom tasks here if needed
      on('task', {
        log(message) {
          console.log(message)
          return null
        },

        // Task for backend API calls during tests
        makeApiCall: async ({ method, url, headers, body }) => {
          const fetch = (await import('node-fetch')).default
          const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
          })
          return {
            status: response.status,
            data: await response.json(),
          }
        },
      })

      return config
    },

    // Environment variables for different environments
    env: {
      // Backend API base URL
      BACKEND_URL: 'http://localhost:3001',

      // Test user credentials
      TEST_EMAIL: 'cypress-test@example.com',
      TEST_NAME: 'Cypress Test User',
      TEST_FAMILY: 'Cypress Test Family',
    },

    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Default command timeout
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
})
