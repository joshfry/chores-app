import React, { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import RecurrenceDaysSelector from './RecurrenceDaysSelector'
import type { Chore } from '../../types/api'

interface EditChoreModalProps {
  isOpen: boolean
  onClose: () => void
  chore: Chore | null
  onSubmit: (
    choreId: number,
    updates: {
      title: string
      description?: string
      isRecurring: boolean
      recurrenceDays?: string[]
    },
  ) => Promise<void>
}

const EditChoreModal: React.FC<EditChoreModalProps> = ({
  isOpen,
  onClose,
  chore,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isRecurring: false,
    recurrenceDays: [] as string[],
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (chore) {
      setFormData({
        title: chore.title,
        description: chore.description || '',
        isRecurring: chore.isRecurring,
        recurrenceDays: chore.recurrenceDays || [],
      })
    }
  }, [chore])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chore) return

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit(chore.id, {
        title: formData.title,
        description: formData.description || undefined,
        isRecurring: formData.isRecurring,
        recurrenceDays:
          formData.isRecurring && formData.recurrenceDays.length > 0
            ? formData.recurrenceDays
            : undefined,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update chore')
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
        form="edit-chore-form"
        disabled={isSubmitting || !formData.title}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        data-testid="submit-button"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Chore" footer={footer}>
      <form id="edit-chore-form" onSubmit={handleSubmit} className="space-y-4">
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
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            data-testid="title-input"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            data-testid="description-input"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              data-testid="recurring-checkbox"
            />
            <span className="text-sm font-medium text-gray-700">
              Recurring Chore
            </span>
          </label>
        </div>

        {formData.isRecurring && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recurrence Days
            </label>
            <RecurrenceDaysSelector
              selectedDays={formData.recurrenceDays}
              onChange={(days) =>
                setFormData((prev) => ({ ...prev, recurrenceDays: days }))
              }
            />
          </div>
        )}
      </form>
    </Modal>
  )
}

export default EditChoreModal
