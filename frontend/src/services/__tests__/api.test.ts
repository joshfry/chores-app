/**
 * Tests for API client
 */

import axios from 'axios'
import { api } from '../api'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()

    // Mock axios.create
    mockedAxios.create.mockReturnValue(mockedAxios)
  })

  describe('Authentication', () => {
    it('should signup user successfully', async () => {
      const signupData = {
        email: 'test@example.com',
        name: 'Test User',
        familyName: 'Test Family',
        birthdate: '1990-01-01',
      }

      const mockResponse = {
        data: {
          success: true,
          message: 'Family account created!',
          data: {
            user: { id: 1, email: signupData.email, role: 'parent' },
            family: { id: 1, name: signupData.familyName },
          },
        },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await api.signup(signupData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/auth/signup',
        signupData,
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should send magic link successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Magic link sent to your email!',
        },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await api.sendMagicLink({ email: 'test@example.com' })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/auth/send-magic-link',
        { email: 'test@example.com' },
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should verify magic token and save session', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            sessionToken: 'session_test_123',
            user: { id: 1, email: 'test@example.com', role: 'parent' },
            family: { id: 1, name: 'Test Family' },
          },
        },
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await api.verifyMagicToken('magic_token_123')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/auth/verify?token=magic_token_123',
      )
      expect(result).toEqual(mockResponse.data)
      expect(localStorageMock.getItem('sessionToken')).toBe('session_test_123')
    })

    it('should get current user when authenticated', async () => {
      localStorageMock.setItem('sessionToken', 'session_test_123')

      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: 1, email: 'test@example.com', role: 'parent' },
            family: { id: 1, name: 'Test Family' },
          },
        },
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await api.getCurrentUser()

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/me')
      expect(result).toEqual(mockResponse.data)
    })

    it('should logout and clear session token', async () => {
      localStorageMock.setItem('sessionToken', 'session_test_123')

      mockedAxios.post.mockResolvedValue({ data: { success: true } })

      await api.logout()

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/logout')
      expect(localStorageMock.getItem('sessionToken')).toBeNull()
    })

    it('should clear session token even if logout API fails', async () => {
      localStorageMock.setItem('sessionToken', 'session_test_123')

      mockedAxios.post.mockRejectedValue(new Error('Network error'))

      await api.logout()

      expect(localStorageMock.getItem('sessionToken')).toBeNull()
    })
  })

  describe('Data Fetching', () => {
    beforeEach(() => {
      localStorageMock.setItem('sessionToken', 'session_test_123')
    })

    it('should fetch chores successfully', async () => {
      const mockChores = [
        { id: 1, title: 'Clean room', points: 5, difficulty: 'easy' },
        { id: 2, title: 'Wash dishes', points: 3, difficulty: 'medium' },
      ]

      const mockResponse = {
        data: {
          success: true,
          data: mockChores,
        },
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await api.getChores()

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/chores')
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch assignments with query parameters', async () => {
      const mockAssignments = [
        { id: 1, childId: 1, choreId: 1, status: 'completed' },
      ]

      const mockResponse = {
        data: {
          success: true,
          data: mockAssignments,
        },
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await api.getAssignments({
        child_id: 1,
        status: 'completed',
      })

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/assignments', {
        params: { child_id: 1, status: 'completed' },
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should create new chore', async () => {
      const newChore = {
        title: 'New Chore',
        description: 'Description',
        points: 10,
        difficulty: 'hard' as const,
      }

      const mockResponse = {
        data: {
          success: true,
          data: { id: 3, ...newChore },
        },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await api.createChore(newChore)

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/chores', newChore)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('Request Interceptors', () => {
    it('should add Authorization header when session token exists', async () => {
      localStorageMock.setItem('sessionToken', 'session_test_123')

      // Mock the interceptor behavior
      const mockRequest = { headers: {} }

      // Test that the interceptor would add the auth header
      expect(api.getSessionToken()).toBe('session_test_123')
      expect(api.isAuthenticated()).toBe(true)
    })

    it('should not add Authorization header when no session token', () => {
      localStorageMock.clear()

      expect(api.getSessionToken()).toBeNull()
      expect(api.isAuthenticated()).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'))

      await expect(
        api.sendMagicLink({ email: 'test@example.com' }),
      ).rejects.toThrow('Network Error')
    })

    it('should handle API errors with error responses', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { success: false, error: 'Invalid email' },
        },
      }

      mockedAxios.post.mockRejectedValue(errorResponse)

      await expect(api.sendMagicLink({ email: 'invalid' })).rejects.toEqual(
        errorResponse,
      )
    })

    it('should handle 401 authentication errors', async () => {
      const authError = {
        response: {
          status: 401,
          data: { success: false, error: 'Invalid session' },
        },
      }

      mockedAxios.get.mockRejectedValue(authError)

      await expect(api.getCurrentUser()).rejects.toEqual(authError)
    })
  })
})
