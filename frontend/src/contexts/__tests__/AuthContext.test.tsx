/**
 * Tests for AuthContext
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock the API
jest.mock('../../services/api', () => ({
  api: {
    isAuthenticated: jest.fn(),
    getSessionToken: jest.fn(),
    getCurrentUser: jest.fn(),
    sendMagicLink: jest.fn(),
    signup: jest.fn(),
    verifyMagicToken: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
  },
}))

import { api } from '../../services/api'
import type { User, Family } from '../../types/api'
const mockApi = api as jest.Mocked<typeof api>

// Mock data helpers
const createMockUser = (overrides?: Partial<User>): User => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'parent',
  familyId: 1,
  birthdate: '1990-01-01',
  createdBy: null,
  lastLogin: new Date().toISOString(),
  isActive: true,
  ...overrides,
})

const createMockFamily = (overrides?: Partial<Family>): Family => ({
  id: 1,
  name: 'Test Family',
  createdDate: new Date().toISOString(),
  primaryParentId: 1,
  ...overrides,
})

// Test component to use the auth context
const TestComponent: React.FC = () => {
  const {
    state,
    login,
    signup,
    verifyMagicToken,
    logout,
    updateCurrentUser,
    clearError,
    refreshUser,
  } = useAuth()

  return (
    <div>
      <div data-testid="loading">
        {state.isLoading ? 'Loading' : 'Not Loading'}
      </div>
      <div data-testid="authenticated">
        {state.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user">{state.user ? state.user.name : 'No User'}</div>
      <div data-testid="error">{state.error || 'No Error'}</div>

      <button data-testid="login-btn" onClick={() => login('test@example.com')}>
        Login
      </button>
      <button
        data-testid="signup-btn"
        onClick={() => signup('test@example.com', 'Test User', 'Test Family')}
      >
        Signup
      </button>
      <button
        data-testid="verify-btn"
        onClick={() => verifyMagicToken('token123')}
      >
        Verify
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
      <button
        data-testid="update-btn"
        onClick={() => updateCurrentUser({ name: 'Updated Name' })}
      >
        Update User
      </button>
      <button data-testid="clear-error-btn" onClick={() => clearError()}>
        Clear Error
      </button>
      <button data-testid="refresh-btn" onClick={() => refreshUser()}>
        Refresh User
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should start with loading state when user is authenticated', async () => {
      mockApi.getSessionToken.mockReturnValue('test-session-token')
      mockApi.getCurrentUser.mockResolvedValue({
        success: true,
        message: 'User fetched',
        data: {
          user: createMockUser(),
          family: createMockFamily(),
        },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      // Should start loading
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading')

      // Should eventually authenticate
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated',
        )
        expect(screen.getByTestId('user')).toHaveTextContent('Test User')
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })
    })

    it('should start unauthenticated when no session token', async () => {
      mockApi.getSessionToken.mockReturnValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated',
        )
        expect(screen.getByTestId('user')).toHaveTextContent('No User')
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })
    })
  })

  describe('Login Flow', () => {
    it('should handle successful login (magic link sent)', async () => {
      mockApi.isAuthenticated.mockReturnValue(false)
      mockApi.sendMagicLink.mockResolvedValue({
        success: true,
        message: 'Magic link sent!',
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      fireEvent.click(screen.getByTestId('login-btn'))

      await waitFor(() => {
        expect(mockApi.sendMagicLink).toHaveBeenCalledWith({
          email: 'test@example.com',
        })
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated',
        )
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })
    })

    it('should handle login errors', async () => {
      mockApi.isAuthenticated.mockReturnValue(false)
      mockApi.sendMagicLink.mockRejectedValue({
        response: { data: { error: 'User not found' } },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      fireEvent.click(screen.getByTestId('login-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('User not found')
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated',
        )
      })
    })
  })

  describe('Signup Flow', () => {
    it('should handle successful signup', async () => {
      mockApi.isAuthenticated.mockReturnValue(false)
      mockApi.signup.mockResolvedValue({
        success: true,
        message: 'Account created! Check your email.',
        data: {
          user: createMockUser(),
          family: createMockFamily(),
        },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      fireEvent.click(screen.getByTestId('signup-btn'))

      await waitFor(() => {
        expect(mockApi.signup).toHaveBeenCalledWith({
          email: 'test@example.com',
          name: 'Test User',
          familyName: 'Test Family',
        })
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated',
        )
      })
    })
  })

  describe('Magic Token Verification', () => {
    it('should handle successful token verification', async () => {
      mockApi.isAuthenticated.mockReturnValue(false)
      mockApi.verifyMagicToken.mockResolvedValue({
        success: true,
        message: 'Token verified',
        data: {
          user: createMockUser(),
          family: createMockFamily(),
          sessionToken: 'session_123',
        },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      fireEvent.click(screen.getByTestId('verify-btn'))

      await waitFor(() => {
        expect(mockApi.verifyMagicToken).toHaveBeenCalledWith('token123')
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated',
        )
        expect(screen.getByTestId('user')).toHaveTextContent('Test User')
      })
    })

    it('should handle token verification errors', async () => {
      mockApi.isAuthenticated.mockReturnValue(false)
      mockApi.verifyMagicToken.mockRejectedValue({
        response: { data: { error: 'Invalid token' } },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      fireEvent.click(screen.getByTestId('verify-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid token')
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated',
        )
      })
    })
  })

  describe('Logout', () => {
    it('should handle successful logout', async () => {
      mockApi.isAuthenticated.mockReturnValue(true)
      mockApi.getCurrentUser.mockResolvedValue({
        success: true,
        message: 'User fetched',
        data: {
          user: createMockUser(),
          family: createMockFamily(),
        },
      })
      mockApi.logout.mockResolvedValue()

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      // Wait for initial authentication
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Authenticated',
        )
      })

      fireEvent.click(screen.getByTestId('logout-btn'))

      await waitFor(() => {
        expect(mockApi.logout).toHaveBeenCalled()
        expect(screen.getByTestId('authenticated')).toHaveTextContent(
          'Not Authenticated',
        )
        expect(screen.getByTestId('user')).toHaveTextContent('No User')
      })
    })
  })

  describe('Utility Functions', () => {
    it('should clear errors', async () => {
      mockApi.isAuthenticated.mockReturnValue(false)
      mockApi.sendMagicLink.mockRejectedValue({
        response: { data: { error: 'Test error' } },
      })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
      })

      // Cause an error
      fireEvent.click(screen.getByTestId('login-btn'))
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Test error')
      })

      // Clear the error
      fireEvent.click(screen.getByTestId('clear-error-btn'))
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('No Error')
      })
    })

    it('should refresh user data', async () => {
      mockApi.getSessionToken.mockReturnValue('test-session-token')
      mockApi.isAuthenticated.mockReturnValue(true)
      mockApi.getCurrentUser
        .mockResolvedValueOnce({
          success: true,
          message: 'User fetched',
          data: {
            user: createMockUser(),
            family: createMockFamily(),
          },
        })
        .mockResolvedValueOnce({
          success: true,
          message: 'User updated',
          data: {
            user: createMockUser({ name: 'Updated User' }),
            family: createMockFamily(),
          },
        })

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Test User')
      })

      // Refresh user data
      fireEvent.click(screen.getByTestId('refresh-btn'))

      await waitFor(() => {
        expect(mockApi.getCurrentUser).toHaveBeenCalledTimes(2)
        expect(screen.getByTestId('user')).toHaveTextContent('Updated User')
      })
    })
  })
})
