import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { Assignment, Chore, User } from '../../types/api'
import CreateAssignmentModal from './CreateAssignmentModal'
import EditAssignmentModal from './EditAssignmentModal'
import ConfirmDialog from '../../components/ConfirmDialog'

const AssignmentsPage: React.FC = () => {
  const { state } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Auto-set filter to child's ID if child is logged in
  const [childFilter, setChildFilter] = useState<string>(
    state.user?.role === 'child' ? state.user.id.toString() : 'all',
  )
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null)

  // Day filter for child users (default to today)
  const daysOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  const today = daysOfWeek[new Date().getDay()]
  const [selectedDay, setSelectedDay] = useState<string>(today)

  // Day navigation handlers
  const handlePreviousDay = () => {
    const currentIndex = daysOfWeek.indexOf(selectedDay)
    const previousIndex = currentIndex === 0 ? 6 : currentIndex - 1
    setSelectedDay(daysOfWeek[previousIndex])
  }

  const handleNextDay = () => {
    const currentIndex = daysOfWeek.indexOf(selectedDay)
    const nextIndex = currentIndex === 6 ? 0 : currentIndex + 1
    setSelectedDay(daysOfWeek[nextIndex])
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Update filter when user changes (e.g., login/logout)
  useEffect(() => {
    if (state.user?.role === 'child') {
      setChildFilter(state.user.id.toString())
    }
  }, [state.user])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [assignmentsResponse, choresResponse, usersResponse] =
        await Promise.all([
          api.getAssignments().catch(() => ({ success: false, data: [] })),
          api.getChores().catch(() => ({ success: false, data: [] })),
          api.getUsers().catch(() => ({ success: false, data: [] })),
        ])

      if (assignmentsResponse.success) {
        setAssignments(assignmentsResponse.data || [])
      }

      if (choresResponse.success) {
        setChores(choresResponse.data || [])
      }

      if (usersResponse.success) {
        setUsers(usersResponse.data || [])
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || 'Failed to load data',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAssignment = async (assignmentData: {
    childId: number
    startDate: string
    choreIds: number[]
    notes?: string
  }) => {
    await api.createAssignment(assignmentData)
    await fetchData()
  }

  const handleUpdateAssignment = async (
    id: number,
    assignmentData: {
      childId: number
      startDate: string
      choreIds: number[]
      notes?: string
    },
  ) => {
    await api.updateAssignment(id, assignmentData)
    await fetchData()
    setSelectedAssignment(null)
  }

  const handleToggleChoreStatus = async (
    assignmentId: number,
    choreId: number,
    currentStatus: string,
  ) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
      await api.updateAssignmentChore(assignmentId, choreId, {
        status: newStatus,
      })
      await fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to update chore status')
    }
  }

  const handleRemoveChoreFromAssignment = async (
    assignment: Assignment,
    choreId: number,
  ) => {
    try {
      const updatedChoreIds =
        assignment.chores
          ?.filter((ac) => ac.choreId !== choreId)
          .map((ac) => ac.choreId) || []

      if (updatedChoreIds.length === 0) {
        setError('Cannot remove the last chore. Delete the assignment instead.')
        return
      }

      await api.updateAssignment(assignment.id, {
        childId: assignment.childId,
        startDate: assignment.startDate,
        choreIds: updatedChoreIds,
        notes: assignment.notes,
      })
      await fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to remove chore')
    }
  }

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return
    await api.deleteAssignment(selectedAssignment.id)
    await fetchData()
    setSelectedAssignment(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getUserById = (userId: number) => {
    return users.find((user) => user.id === userId)
  }

  const filteredAssignments = assignments.filter((assignment) => {
    if (childFilter !== 'all' && assignment.childId !== parseInt(childFilter)) {
      return false
    }
    return true
  })

  // Debug logging for child users
  if (state.user?.role === 'child') {
    console.log('🔍 Child Debug Info:', {
      userId: state.user.id,
      userName: state.user.name,
      childFilter,
      totalAssignments: assignments.length,
      filteredAssignments: filteredAssignments.length,
      assignments: assignments.map((a) => ({
        id: a.id,
        childId: a.childId,
        matches: a.childId === parseInt(childFilter),
      })),
    })
  }

  const children = users.filter((user) => user.role === 'child')

  if (isLoading) {
    return (
      <div className="p-6" data-testid="assignments-page">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          Loading assignments...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6" data-testid="assignments-page">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6" data-testid="assignments-page">
      <div
        className="flex items-center justify-between mb-6"
        data-testid="assignments-header"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          {state.user?.role === 'child'
            ? 'My Assignments'
            : 'Weekly Assignments'}
        </h1>
        <div className="flex items-center gap-3">
          {/* Only show filter dropdown for parents */}
          {state.user?.role === 'parent' && (
            <select
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Children</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          )}

          {state.user?.role === 'parent' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              data-testid="create-assignment-button"
            >
              Create Assignment
            </button>
          )}
        </div>
      </div>

      {/* Day selector for child users */}
      {state.user?.role === 'child' && (
        <div
          className="mb-6 bg-white rounded-lg shadow p-4"
          data-testid="day-selector"
        >
          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <button
              onClick={handlePreviousDay}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              data-testid="previous-day-button"
              aria-label="Previous day"
            >
              ← Previous
            </button>

            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none capitalize font-medium"
              data-testid="day-select"
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day} className="capitalize">
                  {day}
                  {day === today ? ' (Today)' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextDay}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              data-testid="next-day-button"
              aria-label="Next day"
            >
              Next →
            </button>
          </div>

          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {daysOfWeek.map((day) => {
              const isToday = day === today
              const isSelected = day === selectedDay
              const dayShort = day.substring(0, 3).toUpperCase()

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isToday
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`day-button-${day}`}
                >
                  {dayShort}
                  {isToday && !isSelected && (
                    <span className="ml-1 text-xs">•</span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-2 text-sm text-gray-600">
            Showing chores for{' '}
            <span className="font-semibold capitalize">{selectedDay}</span>
          </div>
        </div>
      )}

      {/* Progress bar for child users */}
      {state.user?.role === 'child' &&
        filteredAssignments.length > 0 &&
        (() => {
          // Calculate total chores for selected day across all assignments
          let totalChoresForDay = 0
          let completedChoresForDay = 0

          filteredAssignments.forEach((assignment) => {
            assignment.chores?.forEach((assignmentChore) => {
              const recurrenceDays = assignmentChore.chore?.recurrenceDays
              // Check if chore should show on selected day
              // "everyday" means Mon-Sat (no chores on Sunday)
              const shouldShow =
                !recurrenceDays ||
                recurrenceDays.length === 0 ||
                (recurrenceDays.includes('everyday') &&
                  selectedDay !== 'sunday') ||
                recurrenceDays.includes(selectedDay)

              if (shouldShow) {
                totalChoresForDay++
                if (assignmentChore.status === 'completed') {
                  completedChoresForDay++
                }
              }
            })
          })

          const progressPercentage =
            totalChoresForDay > 0
              ? Math.round((completedChoresForDay / totalChoresForDay) * 100)
              : 0

          return (
            <div
              className="mb-6 bg-white rounded-lg shadow p-4"
              data-testid="day-progress"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Today's Progress
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {completedChoresForDay} of {totalChoresForDay} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPercentage === 100
                      ? 'bg-green-500'
                      : progressPercentage >= 50
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="mt-1 text-right text-xs text-gray-500">
                {progressPercentage}%
              </div>
            </div>
          )
        })()}

      {filteredAssignments.length === 0 ? (
        <div
          className="text-center py-12 bg-white rounded-lg shadow"
          data-testid="assignments-empty-state"
        >
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No assignments found
          </h3>
          <p className="text-gray-600 mb-6">
            {assignments.length === 0
              ? 'Create weekly assignments to track chore completion.'
              : 'No assignments match your current filters.'}
          </p>
          {state.user?.role === 'parent' && assignments.length === 0 && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              data-testid="create-first-assignment-button"
            >
              Create Your First Assignment
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full" data-testid="assignments-table">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Child
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                {state.user?.role === 'parent' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => {
                const child = getUserById(assignment.childId)
                const endDate = assignment.endDate || 'Ongoing'

                // Filter chores for child users by selected day
                const displayChores =
                  state.user?.role === 'child'
                    ? assignment.chores?.filter((assignmentChore) => {
                        const recurrenceDays =
                          assignmentChore.chore?.recurrenceDays
                        if (!recurrenceDays || recurrenceDays.length === 0) {
                          return true
                        }
                        // "everyday" means Mon-Sat (no chores on Sunday)
                        // Show if "everyday" is selected (and not Sunday) OR if selected day is in recurrence days
                        return (
                          (recurrenceDays.includes('everyday') &&
                            selectedDay !== 'sunday') ||
                          recurrenceDays.includes(selectedDay)
                        )
                      })
                    : assignment.chores

                const totalChores = displayChores?.length || 0
                const completedChores =
                  displayChores?.filter((c) => c.status === 'completed')
                    .length || 0

                return (
                  <tr
                    key={assignment.id}
                    className="hover:bg-gray-50 transition-colors"
                    data-testid="assignment-row"
                  >
                    <td
                      className="px-6 py-4 font-medium text-gray-900"
                      data-testid="assignment-child-name"
                    >
                      {child?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(assignment.startDate)} -{' '}
                      {endDate !== 'Ongoing' ? formatDate(endDate) : endDate}
                    </td>
                    <td className="px-6 py-4">
                      {totalChores === 0 && state.user?.role === 'child' ? (
                        <div className="text-sm text-gray-500 italic py-2">
                          🎉 No chores scheduled for {selectedDay}
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <tbody>
                            {assignment.chores
                              ?.filter((assignmentChore) => {
                                // For child users, filter by selected day
                                if (state.user?.role === 'child') {
                                  const recurrenceDays =
                                    assignmentChore.chore?.recurrenceDays
                                  // If no recurrence days, show for all days (one-time chores)
                                  if (
                                    !recurrenceDays ||
                                    recurrenceDays.length === 0
                                  ) {
                                    return true
                                  }
                                  // "everyday" means Mon-Sat (no chores on Sunday)
                                  // Show if "everyday" is selected (and not Sunday) OR if selected day is in recurrence days
                                  return (
                                    (recurrenceDays.includes('everyday') &&
                                      selectedDay !== 'sunday') ||
                                    recurrenceDays.includes(selectedDay)
                                  )
                                }
                                // For parents, show all chores
                                return true
                              })
                              .map((assignmentChore) => (
                                <tr
                                  key={assignmentChore.id}
                                  className="border-b last:border-0"
                                  data-testid="chore-item"
                                >
                                  <td className="py-1 pr-2">
                                    {assignmentChore.chore?.title ||
                                      'Unknown Chore'}
                                    {state.user?.role === 'parent' &&
                                      assignmentChore.chore?.recurrenceDays &&
                                      assignmentChore.chore.recurrenceDays
                                        .length > 0 && (
                                        <span className="text-xs text-gray-500 ml-1">
                                          (
                                          {assignmentChore.chore.recurrenceDays.join(
                                            ', ',
                                          )}
                                          )
                                        </span>
                                      )}
                                  </td>
                                  <td className="py-1 px-2 text-center">
                                    <span
                                      className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        assignmentChore.status === 'completed'
                                          ? 'bg-green-100 text-green-800'
                                          : assignmentChore.status === 'skipped'
                                            ? 'bg-gray-100 text-gray-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                      }`}
                                      data-testid="chore-status"
                                    >
                                      {assignmentChore.status}
                                    </span>
                                  </td>
                                  <td className="py-1 pl-2 text-right">
                                    {(state.user?.role === 'parent' ||
                                      (state.user?.role === 'child' &&
                                        assignment.childId ===
                                          state.user.id)) && (
                                      <div className="flex gap-1 justify-end">
                                        <button
                                          onClick={() =>
                                            handleToggleChoreStatus(
                                              assignment.id,
                                              assignmentChore.choreId,
                                              assignmentChore.status,
                                            )
                                          }
                                          className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                          data-testid="toggle-chore-button"
                                        >
                                          {assignmentChore.status ===
                                          'completed'
                                            ? '✗'
                                            : '✓'}
                                        </button>
                                        {state.user?.role === 'parent' && (
                                          <button
                                            onClick={() =>
                                              handleRemoveChoreFromAssignment(
                                                assignment,
                                                assignmentChore.choreId,
                                              )
                                            }
                                            className="px-2 py-0.5 text-xs border border-red-300 rounded hover:bg-red-50 transition-colors"
                                            data-testid="remove-chore-button"
                                            title="Remove chore from assignment"
                                          >
                                            🗑️
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {completedChores}/{totalChores} completed
                      {state.user?.role === 'child' && totalChores > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          for {selectedDay}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {assignment.notes || '-'}
                    </td>
                    {state.user?.role === 'parent' && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment)
                              setIsEditModalOpen(true)
                            }}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            data-testid="edit-assignment-button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="px-3 py-1 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50 transition-colors"
                            data-testid="delete-assignment-button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        children={children}
        chores={chores}
        onSubmit={handleCreateAssignment}
      />

      <EditAssignmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedAssignment(null)
        }}
        assignment={selectedAssignment}
        children={children}
        chores={chores}
        onSubmit={handleUpdateAssignment}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedAssignment(null)
        }}
        onConfirm={handleDeleteAssignment}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

export default AssignmentsPage
