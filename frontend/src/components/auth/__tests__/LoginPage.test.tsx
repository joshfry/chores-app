/**
 * Tests for LoginPage component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../../../pages/auth/LoginPage'
import { AuthProvider } from '../../../contexts/AuthContext'

// Mock the API
jest.mock('../../../services/api', () => ({
  api: {
    sendMagicLink: jest.fn(),
  },
}))

import { api } from '../../../services/api'
const mockApi = api as jest.Mocked<typeof api>

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
)

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form with required elements', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    )

    // Check for form elements with data-testid attributes
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('send-magic-link-button')).toBeInTheDocument()

    // Check for labels and text
    expect(screen.getByText(/email/i)).toBeInTheDocument()
    expect(screen.getByText(/send magic link/i)).toBeInTheDocument()
  })

  it('should validate email input', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    )

    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('send-magic-link-button')

    // Try to submit without email
    fireEvent.click(submitButton)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })

    // Try with invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('should submit valid email successfully', async () => {
    mockApi.sendMagicLink.mockResolvedValue({
      success: true,
      message: 'Magic link sent to your email!',
    })

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    )

    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('send-magic-link-button')

    // Enter valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    // Should call API
    await waitFor(() => {
      expect(mockApi.sendMagicLink).toHaveBeenCalledWith({
        email: 'test@example.com',
      })
    })

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/magic link sent/i)).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    mockApi.sendMagicLink.mockRejectedValue({
      response: {
        data: {
          error: 'User not found',
        },
      },
    })

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    )

    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('send-magic-link-button')

    fireEvent.change(emailInput, { target: { value: 'notfound@example.com' } })
    fireEvent.click(submitButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText(/user not found/i)).toBeInTheDocument()
    })
  })

  it('should show loading state during submission', async () => {
    // Mock a delayed response
    mockApi.sendMagicLink.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100),
        ),
    )

    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    )

    const emailInput = screen.getByTestId('email-input')
    const submitButton = screen.getByTestId('send-magic-link-button')

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    // Should show loading state
    expect(screen.getByText(/sending/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/magic link sent/i)).toBeInTheDocument()
    })
  })

  it('should have link to signup page', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    )

    const signupLink = screen.getByText(/create account/i)
    expect(signupLink).toBeInTheDocument()
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup')
  })

  it('should be accessible', () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>,
    )

    // Check for proper labels
    const emailInput = screen.getByTestId('email-input')
    expect(emailInput).toHaveAttribute(
      'aria-label',
      expect.stringContaining('email'),
    )

    // Check for form accessibility
    const form = screen.getByTestId('login-form')
    expect(form).toBeInTheDocument()
  })
})
