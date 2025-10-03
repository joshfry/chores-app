import React, { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import type { User, Chore, Assignment } from '../../types/api'

interface EditAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: Assignment | null
  children: User[]
  chores: Chore[]
  onSubmit: (
    id: number,
    assignmentData: {
      childId: number
      startDate: string
      choreIds: number[]
      notes?: string
    },
  ) => Promise<void>
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  children,
  chores,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    childId: '',
    startDate: '',
    choreIds: [] as number[],
    notes: '',
  })
  const [selectedChoreToAdd, setSelectedChoreToAdd] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (assignment) {
      setFormData({
        childId: assignment.childId.toString(),
        startDate: assignment.startDate,
        choreIds: assignment.chores?.map((ac) => ac.choreId) || [],
        notes: assignment.notes || '',
      })
    }
  }, [assignment])

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

  const handleAddChore = () => {
    if (!selectedChoreToAdd) return

    const choreId = parseInt(selectedChoreToAdd)
    if (!formData.choreIds.includes(choreId)) {
      setFormData((prev) => ({
        ...prev,
        choreIds: [...prev.choreIds, choreId],
      }))
      setSelectedChoreToAdd('')
    }
  }

  const handleRemoveChore = (choreId: number) => {
    setFormData((prev) => ({
      ...prev,
      choreIds: prev.choreIds.filter((id) => id !== choreId),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignment) return

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit(assignment.id, {
        childId: parseInt(formData.childId),
        startDate: formData.startDate,
        choreIds: formData.choreIds,
        notes: formData.notes || undefined,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getChoreById = (choreId: number) => {
    return chores.find((c) => c.id === choreId)
  }

  const availableChores = chores.filter(
    (chore) => !formData.choreIds.includes(chore.id),
  )

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
        form="edit-assignment-form"
        disabled={
          isSubmitting ||
          !formData.childId ||
          !formData.startDate ||
          formData.choreIds.length === 0
        }
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        data-testid="submit-button"
      >
        {isSubmitting ? 'Updating...' : 'Update Assignment'}
      </button>
    </div>
  )

  if (!assignment) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Weekly Assignment"
      footer={footer}
    >
      <form
        id="edit-assignment-form"
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
            Assigned Chores *
          </label>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full text-sm" data-testid="chores-table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Chore
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Recurrence
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.choreIds.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-4 text-center text-gray-500"
                    >
                      No chores assigned. Add chores below.
                    </td>
                  </tr>
                ) : (
                  formData.choreIds.map((choreId) => {
                    const chore = getChoreById(choreId)
                    if (!chore) return null

                    return (
                      <tr
                        key={choreId}
                        className="hover:bg-gray-50"
                        data-testid={`assigned-chore-${choreId}`}
                      >
                        <td className="px-3 py-2">{chore.title}</td>
                        <td className="px-3 py-2 text-gray-600">
                          {chore.isRecurring && chore.recurrenceDays
                            ? chore.recurrenceDays.join(', ')
                            : 'One-time'}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveChore(choreId)}
                            className="px-2 py-1 text-xs border border-red-300 rounded text-red-700 hover:bg-red-50 transition-colors"
                            data-testid={`remove-chore-${choreId}`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <label
            htmlFor="addChore"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Add Chore
          </label>
          <div className="flex gap-2">
            <select
              id="addChore"
              value={selectedChoreToAdd}
              onChange={(e) => setSelectedChoreToAdd(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              data-testid="add-chore-select"
            >
              <option value="">Select a chore to add</option>
              {availableChores.map((chore) => (
                <option key={chore.id} value={chore.id}>
                  {chore.title}
                  {chore.recurrenceDays && chore.recurrenceDays.length > 0
                    ? ` (${chore.recurrenceDays.join(', ')})`
                    : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddChore}
              disabled={!selectedChoreToAdd}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              data-testid="add-chore-button"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes (Optional)
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

export default EditAssignmentModal
