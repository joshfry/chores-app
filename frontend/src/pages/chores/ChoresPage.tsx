import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { Chore, User } from '../../types/api'
import CreateChoreModal from './CreateChoreModal'
import EditChoreModal from './EditChoreModal'
import CreateAssignmentModal from '../assignments/CreateAssignmentModal'
import ConfirmDialog from '../../components/ConfirmDialog'

const ChoresPage: React.FC = () => {
  const { state } = useAuth()
  const [chores, setChores] = useState<Chore[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null)
  const [newlyCreatedChore, setNewlyCreatedChore] = useState<Chore | null>(null)
  const [showAssignPrompt, setShowAssignPrompt] = useState(false)

  useEffect(() => {
    fetchChores()
    fetchUsers()
  }, [])

  const fetchChores = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.getChores()

      if (response.success) {
        setChores(response.data || [])
      } else {
        setError(response.error || 'Failed to load chores')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Failed to load chores',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers()
      if (response.success) {
        setUsers(response.data || [])
      }
    } catch (err: any) {
      console.error('Failed to load users:', err)
    }
  }

  const handleCreateChore = async (choreData: {
    title: string
    description?: string
    isRecurring: boolean
    recurrenceDays?: string[]
  }) => {
    const response = await api.createChore(choreData)
    await fetchChores()

    // Show assign prompt after successful creation
    if (response.success && response.data) {
      setNewlyCreatedChore(response.data)
      setShowAssignPrompt(true)
    }
  }

  const handleEditChore = async (
    choreId: number,
    updates: {
      title: string
      description?: string
      isRecurring: boolean
      recurrenceDays?: string[]
    },
  ) => {
    await api.updateChore(choreId, updates)
    await fetchChores()
  }

  const handleDeleteChore = async () => {
    if (!selectedChore) return
    await api.deleteChore(selectedChore.id)
    await fetchChores()
    setSelectedChore(null)
  }

  const handleCreateAssignment = async (assignmentData: {
    childId: number
    startDate: string
    choreIds: number[]
    notes?: string
  }) => {
    await api.createAssignment(assignmentData)
    setIsAssignModalOpen(false)
    setNewlyCreatedChore(null)
    setShowAssignPrompt(false)
  }

  const handleAssignNow = () => {
    setShowAssignPrompt(false)
    setIsAssignModalOpen(true)
  }

  const handleSkipAssign = () => {
    setShowAssignPrompt(false)
    setNewlyCreatedChore(null)
  }

  const childrenOnly = users.filter((user) => user.role === 'child')

  if (isLoading) {
    return (
      <div data-testid="chores-page">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading chores...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div data-testid="chores-page">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-700 mb-4">Error: {error}</div>
          <button
            onClick={fetchChores}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="chores-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chores</h1>
        {state.user?.role === 'parent' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            data-testid="add-chore-button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Chore
          </button>
        )}
      </div>

      {/* Chores Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {chores.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <div className="text-xl font-semibold text-gray-900 mb-2">
              No chores created yet
            </div>
            <div className="text-gray-600 mb-6">
              Create your first chore to start managing family tasks.
            </div>
            {state.user?.role === 'parent' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                data-testid="add-first-chore-button"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Chore
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recurrence
                  </th>
                  {state.user?.role === 'parent' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chores.map((chore) => (
                  <tr
                    key={chore.id}
                    className="hover:bg-gray-50 transition-colors"
                    data-testid="chore-card"
                  >
                    <td className="px-6 py-4">
                      <div
                        className="font-medium text-gray-900"
                        data-testid="chore-title"
                      >
                        {chore.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {chore.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {chore.isRecurring &&
                        chore.recurrenceDays &&
                        chore.recurrenceDays.length > 0 ? (
                          <div className="text-gray-900">
                            {chore.recurrenceDays.join(', ')}
                          </div>
                        ) : (
                          <span className="text-gray-500">One-time</span>
                        )}
                      </div>
                    </td>
                    {state.user?.role === 'parent' && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedChore(chore)
                              setIsEditModalOpen(true)
                            }}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedChore(chore)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateChoreModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateChore}
      />

      <EditChoreModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedChore(null)
        }}
        chore={selectedChore}
        onSubmit={handleEditChore}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedChore(null)
        }}
        onConfirm={handleDeleteChore}
        title="Delete Chore"
        message={`Are you sure you want to delete "${selectedChore?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Assign Now Prompt */}
      <ConfirmDialog
        isOpen={showAssignPrompt}
        onClose={handleSkipAssign}
        onConfirm={handleAssignNow}
        title="Chore Created Successfully!"
        message={`"${newlyCreatedChore?.title}" has been created. Would you like to assign it to a child now?`}
        confirmText="Assign Now"
        cancelText="Maybe Later"
      />

      {/* Assignment Modal */}
      {newlyCreatedChore && (
        <CreateAssignmentModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false)
            setNewlyCreatedChore(null)
          }}
          children={childrenOnly}
          chores={[newlyCreatedChore]}
          onSubmit={handleCreateAssignment}
        />
      )}
    </div>
  )
}

export default ChoresPage
