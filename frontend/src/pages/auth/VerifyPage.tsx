import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<
    'waiting' | 'verifying' | 'success' | 'error'
  >('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  const { state, verifyMagicToken } = useAuth()
  const hasAttemptedVerification = useRef(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const token = searchParams.get('token')
  const sent = searchParams.get('sent')

  // Handle "waiting" state (no token yet, just sent email)
  useEffect(() => {
    if (sent === 'true' && !token) {
      setStatus('waiting')

      const POLL_INTERVAL = 2000 // 2 seconds
      const POLL_TIMEOUT = 10 * 60 * 1000 // 10 minutes
      const startTime = Date.now()

      // Check for authentication (either from context or localStorage)
      const checkAuth = () => {
        // Check context state
        if (state.isAuthenticated) {
          console.log(
            '✅ Authentication detected via context! Redirecting to dashboard...',
          )
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          navigate('/dashboard')
          return true
        }

        // Also check localStorage directly (for cross-tab updates)
        const sessionToken = localStorage.getItem('sessionToken')
        if (sessionToken) {
          console.log(
            '✅ Authentication detected via localStorage! Redirecting to dashboard...',
          )
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          // Wait a bit for AuthContext to pick up the token, then redirect
          setTimeout(() => {
            navigate('/dashboard')
          }, 1000)
          return true
        }

        return false
      }

      // Set up polling interval
      pollingIntervalRef.current = setInterval(() => {
        if (checkAuth()) return

        // Check if polling has timed out
        const elapsed = Date.now() - startTime
        if (elapsed > POLL_TIMEOUT) {
          console.log('⏱️ Polling timed out after 10 minutes')
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
        }
      }, POLL_INTERVAL)

      // Listen for storage events (cross-tab communication)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'sessionToken' && e.newValue) {
          console.log(
            '✅ Authentication detected via storage event! Redirecting to dashboard...',
          )
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          // Wait a bit for AuthContext to pick up the token, then redirect
          setTimeout(() => {
            navigate('/dashboard')
          }, 1000)
        }
      }

      window.addEventListener('storage', handleStorageChange)

      // Cleanup on unmount
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [sent, token, state.isAuthenticated, navigate])

  // Handle token verification
  useEffect(() => {
    if (hasAttemptedVerification.current || !token) {
      return
    }

    const verify = async () => {
      console.log('🔍 Starting verification with token:', token)

      try {
        hasAttemptedVerification.current = true
        const success = await verifyMagicToken(token)
        console.log('✅ Verification result:', success)
        console.log('🔐 Auth state after verification:', state)

        if (success) {
          setStatus('success')

          // Try to close this tab (works if opened by email link)
          // The original waiting tab will detect auth via polling and redirect
          setTimeout(() => {
            window.close()

            // If window.close() didn't work (tab wasn't opened by script),
            // redirect this tab to dashboard as fallback
            setTimeout(() => {
              navigate('/dashboard')
            }, 500)
          }, 2000)
        } else {
          setStatus('error')
          setErrorMessage(
            'Verification failed. Please request a new magic link.',
          )
        }
      } catch (error: any) {
        setStatus('error')
        setErrorMessage(
          error?.message || 'Verification failed. Please try again.',
        )
      }
    }

    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, verifyMagicToken])

  const renderContent = () => {
    switch (status) {
      case 'waiting':
        return (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              📧
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Check Your Email
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We've sent you a magic link! Click the link in your email to sign
              in.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Tip:</span> This page will
                automatically redirect you once you click the magic link.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Waiting for authentication...</span>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Back to Login
              </button>
            </div>
          </>
        )

      case 'verifying':
        return (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Your Account
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your magic link...
            </p>
          </>
        )

      case 'success':
        return (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl font-bold mb-6">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              You're All Set!
            </h1>
            <p className="text-gray-600 mb-6">
              This tab will close automatically. Your other tab will redirect to
              the dashboard.
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <div className="animate-pulse">✨</div>
              <span>Closing tab...</span>
            </div>
          </>
        )

      case 'error':
        return (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-3xl font-bold mb-6">
              ✕
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => (window.location.href = '/login')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {renderContent()}
      </div>
    </div>
  )
}

export default VerifyPage
