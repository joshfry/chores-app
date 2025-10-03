import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import { User, Chore } from '../../types/api'
import CreateUserModal from '../users/CreateUserModal'
import EditUserModal from '../users/EditUserModal'
import CreateChoreModal from '../chores/CreateChoreModal'
import EditChoreModal from '../chores/EditChoreModal'
import ConfirmDialog from '../../components/ConfirmDialog'

const MyAccountPage: React.FC = () => {
  const { state } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddChoreModal, setShowAddChoreModal] = useState(false)
  const [showEditChoreModal, setShowEditChoreModal] = useState(false)
  const [showDeleteChoreDialog, setShowDeleteChoreDialog] = useState(false)
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersResponse, choresResponse] = await Promise.all([
        api.getUsers(),
        api.getChores(),
      ])

      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data)
      }
      if (choresResponse.success && choresResponse.data) {
        setChores(choresResponse.data)
      }
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: {
    name: string
    email: string
    role: 'parent' | 'child'
    birthdate?: string
  }) => {
    const payload: any = {
      name: userData.name,
      email: userData.email,
    }
    if (userData.birthdate) {
      payload.birthdate = userData.birthdate
    }
    await api.createChild(payload)
    await fetchData()
  }

  const handleEditUser = async (
    userId: number,
    updates: { name: string; birthdate?: string },
  ) => {
    await api.updateUser(userId, updates)
    await fetchData()
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    await api.deleteUser(selectedUser.id)
    await fetchData()
    setSelectedUser(null)
  }

  const handleCreateChore = async (choreData: {
    title: string
    description?: string
    isRecurring: boolean
    recurrenceDays?: string[]
  }) => {
    await api.createChore(choreData)
    await fetchData()
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
    await fetchData()
  }

  const handleDeleteChore = async () => {
    if (!selectedChore) return
    await api.deleteChore(selectedChore.id)
    await fetchData()
    setSelectedChore(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Users Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Family Members
          </h2>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            data-testid="add-user-button"
          >
            + Add User
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.name}
                    {user.id === state.user?.id && (
                      <span className="ml-2 text-xs text-blue-600">(You)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        user.role === 'parent'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowEditUserModal(true)
                        }}
                        className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        data-testid="edit-user-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setShowDeleteUserDialog(true)
                        }}
                        className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                        data-testid="delete-user-button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Chores Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Household Chores
          </h2>
          <button
            onClick={() => setShowAddChoreModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            data-testid="add-chore-button"
          >
            + Add Chore
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chores.map((chore) => (
                <tr
                  key={chore.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {chore.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {chore.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {chore.isRecurring &&
                    chore.recurrenceDays &&
                    chore.recurrenceDays.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {chore.recurrenceDays.map((day) => (
                          <span
                            key={day}
                            className="inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded capitalize"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    ) : (
                      'One-time'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedChore(chore)
                          setShowEditChoreModal(true)
                        }}
                        className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        data-testid="edit-chore-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedChore(chore)
                          setShowDeleteChoreDialog(true)
                        }}
                        className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                        data-testid="delete-chore-button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSubmit={handleCreateUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        user={selectedUser}
        onSubmit={handleEditUser}
      />

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteUserDialog}
        onClose={() => {
          setShowDeleteUserDialog(false)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
      />

      {/* Create Chore Modal */}
      <CreateChoreModal
        isOpen={showAddChoreModal}
        onClose={() => setShowAddChoreModal(false)}
        onSubmit={handleCreateChore}
      />

      {/* Edit Chore Modal */}
      <EditChoreModal
        isOpen={showEditChoreModal}
        onClose={() => setShowEditChoreModal(false)}
        chore={selectedChore}
        onSubmit={handleEditChore}
      />

      {/* Delete Chore Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteChoreDialog}
        onClose={() => {
          setShowDeleteChoreDialog(false)
          setSelectedChore(null)
        }}
        onConfirm={handleDeleteChore}
        title="Delete Chore"
        message={`Are you sure you want to delete "${selectedChore?.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  )
}

export default MyAccountPage
