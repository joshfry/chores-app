import React, { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import type { User } from '../../types/api'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSubmit: (
    userId: number,
    updates: { name: string; birthdate?: string },
  ) => Promise<void>
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        birthdate: user.birthdate || '',
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit(user.id, {
        name: formData.name,
        birthdate: formData.birthdate || undefined,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const footer = (
    <div className="flex gap-3 justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        data-testid="cancel-button"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="edit-user-form"
        disabled={isSubmitting || !formData.name}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        data-testid="submit-button"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" footer={footer}>
      <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"
            data-testid="error-message"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            data-testid="name-input"
          />
        </div>

        <div>
          <label
            htmlFor="birthdate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Birthdate
          </label>
          <input
            id="birthdate"
            name="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            data-testid="birthdate-input"
          />
        </div>
      </form>
    </Modal>
  )
}

export default EditUserModal
