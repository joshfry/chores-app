import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying',
  )
  const [errorMessage, setErrorMessage] = useState('')
  const { verifyMagicToken } = useAuth()
  const hasAttemptedVerification = useRef(false)

  const token = searchParams.get('token')

  // Handle token verification
  useEffect(() => {
    if (hasAttemptedVerification.current || !token) {
      return
    }

    const verify = async () => {
      try {
        hasAttemptedVerification.current = true
        const success = await verifyMagicToken(token)

        if (success) {
          setStatus('success')
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard')
          }, 1500)
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
  }, [token, verifyMagicToken, navigate])

  const renderContent = () => {
    switch (status) {
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
              Successfully Verified!
            </h1>
            <p className="text-gray-600 mb-6">
              Your account has been verified. Redirecting to your dashboard...
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span>Loading dashboard...</span>
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
