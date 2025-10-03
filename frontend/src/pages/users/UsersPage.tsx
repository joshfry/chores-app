import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { User } from '../../types/api'
import CreateUserModal from './CreateUserModal'
import EditUserModal from './EditUserModal'
import ConfirmDialog from '../../components/ConfirmDialog'

const UsersPage: React.FC = () => {
  const { state } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.getUsers()

      if (response.success) {
        setUsers(response.data || [])
      } else {
        setError(response.error || 'Failed to load users')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Failed to load users',
      )
    } finally {
      setIsLoading(false)
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
      role: userData.role,
    }
    if (userData.birthdate) {
      payload.birthdate = userData.birthdate
    }
    await api.createChild(payload)
    await fetchUsers()
  }

  const handleEditUser = async (
    userId: number,
    updates: { name: string; birthdate?: string },
  ) => {
    await api.updateUser(userId, updates)
    await fetchUsers()
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    await api.deleteUser(selectedUser.id)
    await fetchUsers()
    setSelectedUser(null)
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="p-6" data-testid="users-page">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          Loading users...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6" data-testid="users-page">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6" data-testid="users-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
        {state.user?.role === 'parent' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            data-testid="add-child-button"
          >
            Add Child Account
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No family members found
            </h3>
            <p className="text-gray-600 mb-6">
              Start by adding child accounts to manage chores together.
            </p>
            {state.user?.role === 'parent' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                data-testid="add-first-child-button"
              >
                Add Your First Child
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'parent'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                  </td>
                  <td className="px-6 py-4">
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
                          setIsEditModalOpen(true)
                        }}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      {state.user?.role === 'parent' &&
                        user.id !== state.user.id && (
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="px-3 py-1 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onSubmit={handleEditUser}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteUser}
        title="Remove User"
        message={`Are you sure you want to remove ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  )
}

export default UsersPage
