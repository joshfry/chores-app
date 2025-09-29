// Component testing support file
import { mount } from 'cypress/react18'
import './commands'

// Make sure to import your global styles
import '../../src/index.css'

// Add custom mount command for component tests
Cypress.Commands.add('mount', mount)

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}
