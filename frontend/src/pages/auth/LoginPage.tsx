import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { state, login, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    clearError()

    const success = await login(email)

    if (success) {
      setEmailSent(true)
    }

    setIsSubmitting(false)
  }

  const isValidEmail = email.includes('@') && email.includes('.')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600 mb-6">
          Sign in to your family chores account
        </p>

        {state.error && (
          <div
            className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
            data-testid="login-error"
          >
            {state.error}
          </div>
        )}

        {emailSent && (
          <div
            className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg"
            data-testid="login-success"
          >
            <div className="flex items-start">
              <div className="text-2xl mr-3">📧</div>
              <div>
                <p className="font-semibold mb-1">Check your email!</p>
                <p className="text-sm">
                  We've sent a magic link to <strong>{email}</strong>. Click the
                  link in the email to sign in.
                </p>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          data-testid="login-form"
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              required
              data-testid="login-email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isValidEmail}
            data-testid="login-submit"
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Sending Magic Link...' : 'Send Magic Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create a family account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
