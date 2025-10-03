import React, { useState, useEffect } from 'react'
import Modal from '../../components/Modal'
import type { User, Chore, Assignment } from '../../types/api'

interface AssignChoreDialogProps {
  isOpen: boolean
  onClose: () => void
  chore: Chore | null
  children: User[]
  assignments: Assignment[]
  onCreateNew: () => void
  onAddToExisting: (assignment: Assignment) => void
}

const AssignChoreDialog: React.FC<AssignChoreDialogProps> = ({
  isOpen,
  onClose,
  chore,
  children,
  assignments,
  onCreateNew,
  onAddToExisting,
}) => {
  const [selectedOption, setSelectedOption] = useState<'new' | 'existing'>(
    'new',
  )
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('')

  useEffect(() => {
    // Reset when modal opens
    if (isOpen) {
      setSelectedOption(assignments.length > 0 ? 'existing' : 'new')
      setSelectedAssignmentId('')
    }
  }, [isOpen, assignments.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedOption === 'new') {
      onCreateNew()
    } else {
      const assignment = assignments.find(
        (a) => a.id === parseInt(selectedAssignmentId),
      )
      if (assignment) {
        onAddToExisting(assignment)
      }
    }

    onClose()
  }

  const getChildName = (childId: number) => {
    return children.find((c) => c.id === childId)?.name || 'Unknown'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const footer = (
    <div className="flex gap-3 justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="assign-chore-form"
        disabled={selectedOption === 'existing' && !selectedAssignmentId}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign "${chore?.title}"`}
      footer={footer}
    >
      <form
        id="assign-chore-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <p className="text-sm text-gray-600 mb-4">
          Choose how you'd like to assign this chore:
        </p>

        {/* Option 1: Create New Assignment */}
        <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
          <input
            type="radio"
            name="assignOption"
            value="new"
            checked={selectedOption === 'new'}
            onChange={() => setSelectedOption('new')}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              Create New Assignment
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Create a brand new weekly assignment for a child
            </div>
          </div>
        </label>

        {/* Option 2: Add to Existing Assignment */}
        <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
          <input
            type="radio"
            name="assignOption"
            value="existing"
            checked={selectedOption === 'existing'}
            onChange={() => setSelectedOption('existing')}
            disabled={assignments.length === 0}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              Add to Existing Assignment
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {assignments.length === 0
                ? 'No existing assignments available'
                : 'Add this chore to an existing weekly assignment'}
            </div>
          </div>
        </label>

        {/* Select Existing Assignment */}
        {selectedOption === 'existing' && assignments.length > 0 && (
          <div className="ml-7 mt-3">
            <label
              htmlFor="assignment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Assignment
            </label>
            <select
              id="assignment"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Choose an assignment...</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {getChildName(assignment.childId)} - Week of{' '}
                  {formatDate(assignment.startDate)} (
                  {assignment.chores?.length || 0} chores)
                </option>
              ))}
            </select>
          </div>
        )}
      </form>
    </Modal>
  )
}

export default AssignChoreDialog
