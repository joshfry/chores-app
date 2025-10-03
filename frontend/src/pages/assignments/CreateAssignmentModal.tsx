import React, { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import type { User, Chore } from '../../types/api'

interface CreateAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  children: User[]
  chores: Chore[]
  onSubmit: (assignmentData: {
    childId: number
    startDate: string
    choreIds: number[]
    notes?: string
  }) => Promise<void>
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  children,
  chores,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    childId: '',
    startDate: getNextSunday(),
    choreIds: [] as number[],
    notes: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-select chore(s) when modal opens with a specific set of chores
  useEffect(() => {
    if (isOpen && chores.length === 1) {
      setFormData((prev) => ({
        ...prev,
        choreIds: [chores[0].id],
      }))
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        childId: '',
        startDate: getNextSunday(),
        choreIds: [],
        notes: '',
      })
      setError('')
    }
  }, [isOpen, chores])

  function getNextSunday(): string {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + daysUntilSunday)
    return nextSunday.toISOString().split('T')[0]
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleChoreToggle = (choreId: number) => {
    setFormData((prev) => ({
      ...prev,
      choreIds: prev.choreIds.includes(choreId)
        ? prev.choreIds.filter((id) => id !== choreId)
        : [...prev.choreIds, choreId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        childId: parseInt(formData.childId),
        startDate: formData.startDate,
        choreIds: formData.choreIds,
        notes: formData.notes || undefined,
      })
      setFormData({
        childId: '',
        startDate: getNextSunday(),
        choreIds: [],
        notes: '',
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment')
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
        form="create-assignment-form"
        disabled={
          isSubmitting ||
          !formData.childId ||
          !formData.startDate ||
          formData.choreIds.length === 0
        }
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        data-testid="submit-button"
      >
        {isSubmitting ? 'Creating...' : 'Create Assignment'}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Weekly Assignment"
      footer={footer}
    >
      <form
        id="create-assignment-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
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
            htmlFor="childId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Assign To *
          </label>
          <select
            id="childId"
            name="childId"
            value={formData.childId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            data-testid="child-select"
          >
            <option value="">Select a child</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date (Sunday) *
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            data-testid="start-date-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Chores *
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
            {chores.map((chore) => (
              <label
                key={chore.id}
                className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                data-testid={`chore-${chore.id}`}
              >
                <input
                  type="checkbox"
                  checked={formData.choreIds.includes(chore.id)}
                  onChange={() => handleChoreToggle(chore.id)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  data-testid={`checkbox-${chore.id}`}
                />
                <span className="text-sm text-gray-700">
                  {chore.title}
                  {chore.isRecurring &&
                    chore.recurrenceDays &&
                    chore.recurrenceDays.length > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({chore.recurrenceDays.join(', ')})
                      </span>
                    )}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            data-testid="notes-input"
          />
        </div>
      </form>
    </Modal>
  )
}

export default CreateAssignmentModal
