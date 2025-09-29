import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react'
import { api } from '../services/api'
import type { User, Family } from '../types/api'

// Auth State Types
interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  family: Family | null
  error: string | null
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; family: Family | null } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User }

// Auth Context Type
interface AuthContextType {
  state: AuthState
  login: (email: string) => Promise<boolean>
  signup: (
    email: string,
    name: string,
    familyName: string,
    birthdate?: string,
  ) => Promise<boolean>
  verifyMagicToken: (token: string) => Promise<boolean>
  logout: () => Promise<void>
  updateCurrentUser: (updates: Partial<User>) => Promise<boolean>
  clearError: () => void
  refreshUser: () => Promise<void>
}

// Initial State
const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  family: null,
  error: null,
}

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        family: action.payload.family,
        error: null,
      }

    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        family: null,
        error: action.payload,
      }

    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        family: null,
        error: null,
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }

    default:
      return state
  }
}

// Create Context
const AuthContext = createContext<AuthContextType | null>(null)

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (api.isAuthenticated()) {
          const response = await api.getCurrentUser()
          if (response.success && response.data) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: response.data.user,
                family: response.data.family,
              },
            })
          } else {
            dispatch({ type: 'AUTH_LOGOUT' })
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        dispatch({ type: 'AUTH_LOGOUT' })
      }
    }

    checkAuth()
  }, [])

  // Login function (send magic link)
  const login = async (email: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_LOADING' })

      const response = await api.sendMagicLink({ email })

      if (response.success) {
        // Just clear loading state, don't authenticate yet
        dispatch({ type: 'AUTH_LOGOUT' })
        return true
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.error || 'Login failed',
        })
        return false
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Network error'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      return false
    }
  }

  // Signup function
  const signup = async (
    email: string,
    name: string,
    familyName: string,
    birthdate?: string,
  ): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_LOADING' })

      const response = await api.signup({ email, name, familyName, birthdate })

      if (response.success) {
        // Just clear loading state, magic link was sent
        dispatch({ type: 'AUTH_LOGOUT' })
        return true
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.error || 'Signup failed',
        })
        return false
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Network error'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      return false
    }
  }

  // Verify magic token
  const verifyMagicToken = async (token: string): Promise<boolean> => {
    try {
      dispatch({ type: 'AUTH_LOADING' })

      const response = await api.verifyMagicToken(token)

      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            family: response.data.family,
          },
        })
        return true
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.error || 'Verification failed',
        })
        return false
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Verification failed'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      return false
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await api.logout()
    } catch (error) {
      console.warn('Logout API call failed, but continuing with local logout')
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }

  // Update current user
  const updateCurrentUser = async (
    updates: Partial<User>,
  ): Promise<boolean> => {
    if (!state.user) return false

    try {
      const response = await api.updateUser(state.user.id, updates)

      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_USER', payload: response.data })
        return true
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.error || 'Update failed',
        })
        return false
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Update failed'
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage })
      return false
    }
  }

  // Clear error
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (!api.isAuthenticated()) return

    try {
      const response = await api.getCurrentUser()
      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            family: response.data.family,
          },
        })
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  const contextValue: AuthContextType = {
    state,
    login,
    signup,
    verifyMagicToken,
    logout,
    updateCurrentUser,
    clearError,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
