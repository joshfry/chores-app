import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { User, Chore, Assignment, DashboardStats } from '../../types/api'

const DashboardPage: React.FC = () => {
  const { state } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [usersResponse, choresResponse, assignmentsResponse] =
          await Promise.all([
            api.getUsers().catch(() => ({ success: false, data: [] })),
            api.getChores().catch(() => ({ success: false, data: [] })),
            api.getAssignments().catch(() => ({ success: false, data: [] })),
          ])

        if (usersResponse.success) {
          setUsers(usersResponse.data || [])
        }

        if (choresResponse.success) {
          setChores(choresResponse.data || [])
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

  const completedAssignments = filteredAssignments.filter(
    (assignment) => assignment.status === 'completed',
  )
  const pendingAssignments = filteredAssignments.filter(
    (assignment) =>
      assignment.status === 'assigned' || assignment.status === 'in_progress',
  )

  const recentAssignments = filteredAssignments.slice(-5)

  const getBadgeClasses = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-700'
      case 'warning':
        return 'bg-yellow-100 text-yellow-700'
      case 'error':
        return 'bg-red-100 text-red-700'
      case 'info':
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  const getAssignmentBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'overdue':
        return 'error'
      case 'in_progress':
        return 'warning'
      default:
        return 'info'
    }
  }

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

      {/* Progress Card */}
      {stats && stats.totalAssignments > 0 && (
        <div
          className="bg-white rounded-lg shadow p-6"
          data-testid="progress-card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Assignment Completion
          </h3>
          <div className="mb-2">
            <progress
              className="w-full h-4 [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-blue-600 [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-blue-600"
              value={stats.completedAssignments}
              max={stats.totalAssignments}
              data-testid="assignment-progress-bar"
            />
          </div>
          <div className="text-sm text-gray-600" data-testid="progress-label">
            {stats.completedAssignments} of {stats.totalAssignments} assignments
            completed (
            {Math.round(
              (stats.completedAssignments / stats.totalAssignments) * 100,
            )}
            %)
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        data-testid="dashboard-stats"
      >
        <div
          className="bg-white rounded-lg shadow p-4"
          data-testid="stat-members"
        >
          <div
            className="text-3xl font-bold text-gray-900"
            data-testid="stat-members-value"
          >
            {stats?.totalChildren ?? activeUsers.length}
          </div>
          <div className="text-sm text-gray-600">Family Members</div>
        </div>

        <div
          className="bg-white rounded-lg shadow p-4"
          data-testid="stat-children"
        >
          <div
            className="text-3xl font-bold text-gray-900"
            data-testid="stat-children-value"
          >
            {stats?.totalChildren ?? children.length}
          </div>
          <div className="text-sm text-gray-600">Children</div>
        </div>

        <div
          className="bg-white rounded-lg shadow p-4"
          data-testid="stat-chores"
        >
          <div
            className="text-3xl font-bold text-gray-900"
            data-testid="stat-chores-value"
          >
            {stats?.totalChores ?? chores.length}
          </div>
          <div className="text-sm text-gray-600">Total Chores</div>
        </div>

        <div
          className="bg-white rounded-lg shadow p-4"
          data-testid="stat-assignments"
        >
          <div
            className="text-3xl font-bold text-gray-900"
            data-testid="stat-assignments-value"
          >
            {stats?.totalAssignments ?? assignments.length}
          </div>
          <div className="text-sm text-gray-600">Total Assignments</div>
        </div>

        <div
          className="bg-white rounded-lg shadow p-4"
          data-testid="stat-completed"
        >
          <div
            className="text-3xl font-bold text-green-600"
            data-testid="stat-completed-value"
          >
            {stats?.completedAssignments ?? completedAssignments.length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>

        <div
          className="bg-white rounded-lg shadow p-4"
          data-testid="stat-pending"
        >
          <div
            className="text-3xl font-bold text-yellow-600"
            data-testid="stat-pending-value"
          >
            {stats?.pendingAssignments ?? pendingAssignments.length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
      </div>

      {/* Weekly Stats */}
      {stats?.thisWeek && (
        <div className="grid grid-cols-1 gap-4" data-testid="weekly-stats">
          <div
            className="bg-white rounded-lg shadow p-6"
            data-testid="weekly-completed"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              This Week's Completed
            </h3>
            <div className="text-4xl font-bold text-blue-600">
              {stats.thisWeek.assignmentsCompleted}
            </div>
            <div className="text-sm text-gray-600">Assignments completed</div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {stats?.topPerformers?.length ? (
        <div
          className="bg-white rounded-lg shadow p-6"
          data-testid="leaderboard"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Top Performers
          </h2>
          <div className="space-y-3">
            {stats.topPerformers.map((performer: any) => (
              <div
                key={performer.childId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                data-testid="top-performer"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {performer.childName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {performer.choresCompleted} chores completed this week
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Star
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Chores Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Chores</h3>
          <Link
            to="/chores"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            data-testid="manage-chores-link"
          >
            Manage Chores
          </Link>
        </div>
        {chores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="dashboard-chores-table">
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
                    data-testid="dashboard-chore-row"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {chore.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {chore.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {chore.isRecurring &&
                        chore.recurrenceDays &&
                        chore.recurrenceDays.length > 0
                          ? chore.recurrenceDays.join(', ')
                          : 'One-time'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            No chores found. Create your first chore to get started.
          </div>
        )}
      </div>

      {/* Family Members and Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Family Members
            </h3>
            <Link
              to="/users"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              data-testid="manage-users-link"
            >
              Manage Users
            </Link>
          </div>
          <div className="space-y-3">
            {activeUsers.length > 0 ? (
              activeUsers.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  data-testid="dashboard-user-item"
                >
                  <div>
                    <div
                      className="font-medium text-gray-900"
                      data-testid="dashboard-user-name"
                    >
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {user.role}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeClasses(user.role === 'parent' ? 'info' : 'success')}`}
                    data-testid="dashboard-user-role"
                  >
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No family members found</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Assignments
            </h3>
            <Link
              to="/assignments"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              data-testid="view-assignments-link"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentAssignments.length > 0 ? (
              recentAssignments.map((assignment) => {
                const child = users.find((u) => u.id === assignment.childId)
                const choreCount = assignment.chores?.length || 0

                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    data-testid="dashboard-assignment-item"
                  >
                    <div>
                      <div
                        className="font-medium text-gray-900"
                        data-testid="dashboard-assignment-title"
                      >
                        Week of{' '}
                        {new Date(assignment.startDate).toLocaleDateString()}
                      </div>
                      <div
                        className="text-sm text-gray-600"
                        data-testid="dashboard-assignment-subtitle"
                      >
                        {child?.name || 'Unknown'} • {choreCount} chore
                        {choreCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeClasses(getAssignmentBadgeVariant(assignment.status))}`}
                      data-testid="dashboard-assignment-status"
                    >
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="text-gray-500">No assignments yet</div>
            )}
          </div>
        </div>
      </div>

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
