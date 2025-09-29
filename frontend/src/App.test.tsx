import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders family chores app with login form', () => {
  render(<App />)
  const welcomeText = screen.getByText(/welcome back/i)
  const signInText = screen.getByText(/sign in to your family chores account/i)
  const emailInput = screen.getByPlaceholderText(/parent@example.com/i)

  expect(welcomeText).toBeInTheDocument()
  expect(signInText).toBeInTheDocument()
  expect(emailInput).toBeInTheDocument()
})
