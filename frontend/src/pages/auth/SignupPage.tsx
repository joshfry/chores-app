import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    familyName: '',
    birthdate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { state, signup, clearError } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setShowSuccess(false)
    clearError()

    const success = await signup(
      formData.email,
      formData.name,
      formData.familyName,
      formData.birthdate || undefined,
    )

    if (success) {
      setShowSuccess(true)
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'signup-success' },
        })
      }, 1200)
    }

    setIsSubmitting(false)
  }

  const isValid =
    formData.email.includes('@') &&
    formData.email.includes('.') &&
    formData.name.trim() &&
    formData.familyName.trim()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Family Account
        </h1>
        <p className="text-gray-600 mb-6">
          Start managing your family's chores together
        </p>

        {state.error && (
          <div
            className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg"
            data-testid="signup-error"
          >
            {state.error}
          </div>
        )}

        {showSuccess && (
          <div
            className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg"
            data-testid="signup-success"
          >
            🎉 Family account created! Check your email for a magic link to get
            started.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          data-testid="signup-form"
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
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="parent@example.com"
              required
              data-testid="signup-email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Sarah Johnson"
                required
                data-testid="signup-name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="familyName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Family Name
              </label>
              <input
                id="familyName"
                name="familyName"
                type="text"
                value={formData.familyName}
                onChange={handleChange}
                placeholder="Johnson Family"
                required
                data-testid="signup-family-name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="birthdate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Birthdate (Optional)
            </label>
            <input
              id="birthdate"
              name="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            data-testid="signup-submit"
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Family Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
