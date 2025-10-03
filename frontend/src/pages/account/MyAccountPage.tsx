import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import { User, Chore } from '../../types/api'

const MyAccountPage: React.FC = () => {
  const { state } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showAddChoreModal, setShowAddChoreModal] = useState(false)

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              {/* Avatar */}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl mb-3 ${
                  user.role === 'parent'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Name */}
              <h3 className="font-semibold text-gray-900 mb-1">
                {user.name}
                {user.id === state.user?.id && (
                  <span className="block text-xs text-blue-600 font-normal">
                    (You)
                  </span>
                )}
              </h3>

              {/* Email */}
              <p className="text-xs text-gray-600 mb-2 truncate w-full">
                {user.email}
              </p>

              {/* Role Badge */}
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize mb-2 ${
                  user.role === 'parent'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {user.role}
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
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
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurrence
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
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        chore.difficulty === 'easy'
                          ? 'bg-green-100 text-green-800'
                          : chore.difficulty === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {chore.difficulty}
                    </span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals would be implemented here */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add User</h3>
            <p className="text-gray-600 mb-4">
              User creation functionality will be implemented here.
            </p>
            <button
              onClick={() => setShowAddUserModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAddChoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Chore</h3>
            <p className="text-gray-600 mb-4">
              Chore creation functionality will be implemented here.
            </p>
            <button
              onClick={() => setShowAddChoreModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAccountPage
