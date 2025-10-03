import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const VerifyPendingPage: React.FC = () => {
  const { state } = useAuth()
  const navigate = useNavigate()
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingStartTimeRef = useRef<number | null>(null)

  // Poll for authentication
  useEffect(() => {
    const POLL_INTERVAL = 2000 // 2 seconds
    const POLL_TIMEOUT = 10 * 60 * 1000 // 10 minutes

    pollingStartTimeRef.current = Date.now()

    pollingIntervalRef.current = setInterval(() => {
      // Check if authenticated
      if (state.isAuthenticated) {
        console.log('✅ Authentication detected! Redirecting to dashboard...')
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        navigate('/dashboard')
        return
      }

      // Check if polling has timed out
      const elapsed = Date.now() - (pollingStartTimeRef.current || 0)
      if (elapsed > POLL_TIMEOUT) {
        console.log('⏱️ Polling timed out after 10 minutes')
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
      }
    }, POLL_INTERVAL)

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [state.isAuthenticated, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          📧
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Check Your Email
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          We've sent you a magic link! Click the link in your email to sign in.
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
      </div>
    </div>
  )
}

export default VerifyPendingPage
