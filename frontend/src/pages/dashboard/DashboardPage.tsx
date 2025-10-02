import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { User, Assignment, DashboardStats } from '../../types/api'

const DashboardPage: React.FC = () => {
  const { state } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [usersResponse, assignmentsResponse] = await Promise.all([
          api.getUsers().catch(() => ({ success: false, data: [] })),
          api.getAssignments().catch(() => ({ success: false, data: [] })),
        ])

        if (usersResponse.success) {
          setUsers(usersResponse.data || [])
        }

        if (assignmentsResponse.success) {
          setAssignments(assignmentsResponse.data || [])
        }

        const statsResponse = await api.getDashboardStats()

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
          setError(null)
        } else {
          setStats(null)
          setError(statsResponse.error || 'Failed to load dashboard data')
        }
      } catch (err) {
        setStats(null)
        setError('Failed to load dashboard data')
        console.error('Dashboard data fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  const activeUsers = users.filter((user) => user.isActive)
  const children = activeUsers.filter((user) => user.role === 'child')

  // Filter assignments for children - only show their own
  const filteredAssignments =
    state.user?.role === 'child' && state.user.id
      ? assignments.filter(
          (assignment) => assignment.childId === state.user!.id,
        )
      : assignments

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2" data-testid="user-welcome">
          Welcome back, {state.user?.name}! 👋
        </h2>
        <p className="text-blue-100" data-testid="family-name">
          Here's what's happening with {state.family?.name} today.
        </p>
      </div>

      {/* Child Progress Cards */}
      {children.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Children's Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => {
              // Get all assignments for this child
              const childAssignments = assignments.filter(
                (a) => a.childId === child.id,
              )

              const totalAssignments = childAssignments.length

              // Calculate chore-level statistics
              let totalChores = 0
              let completedChores = 0
              let pendingChores = 0
              let skippedChores = 0

              childAssignments.forEach((assignment) => {
                const chores = assignment.chores || []
                totalChores += chores.length

                chores.forEach((chore) => {
                  if (chore.status === 'completed') {
                    completedChores++
                  } else if (chore.status === 'pending') {
                    pendingChores++
                  } else if (chore.status === 'skipped') {
                    skippedChores++
                  }
                })
              })

              // Calculate remaining chores (not completed)
              const remainingChores = totalChores - completedChores

              const completionPercentage =
                totalChores > 0
                  ? Math.round((completedChores / totalChores) * 100)
                  : 0

              return (
                <div
                  key={child.id}
                  className="bg-white rounded-lg shadow p-6"
                  data-testid={`child-progress-${child.id}`}
                >
                  {/* Child Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {child.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {totalAssignments} assignment
                        {totalAssignments !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Overall Progress
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {completedChores}
                      </div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {pendingChores}
                      </div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-600">
                        {skippedChores}
                      </div>
                      <div className="text-xs text-gray-600">Skipped</div>
                    </div>
                  </div>

                  {/* Chore Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Chores</span>
                      <span className="font-medium text-gray-900">
                        {completedChores} / {totalChores} completed
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          data-testid="dashboard-error"
        >
          <div className="text-red-700 mb-2">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
