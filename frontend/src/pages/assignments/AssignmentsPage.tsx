import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { Assignment, Chore, User } from '../../types/api'
import CreateAssignmentModal from './CreateAssignmentModal'
import EditAssignmentModal from './EditAssignmentModal'
import ConfirmDialog from '../../components/ConfirmDialog'

const Container = styled.div``

const Header = styled.div``

const Title = styled.h1``

const Filters = styled.div``

const Select = styled.select``

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>``

const Card = styled.div``

const Table = styled.table``

const Thead = styled.thead``

const Tbody = styled.tbody``

const Tr = styled.tr``

const Th = styled.th``

const Td = styled.td``

const ChoreStatus = styled.span<{
  $status: 'pending' | 'completed' | 'skipped'
}>``

const ActionButtons = styled.div``

const ChoreTable = styled.table``

const LoadingCard = styled(Card)``

const ErrorCard = styled(Card)``

const EmptyState = styled.div``

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

  const children = users.filter((user) => user.role === 'child')

  if (isLoading) {
    return (
      <Container data-testid="assignments-page">
        <LoadingCard>Loading assignments...</LoadingCard>
      </Container>
    )
  }

  if (error) {
    return (
      <Container data-testid="assignments-page">
        <ErrorCard>
          <div>Error: {error}</div>
          <Button onClick={fetchData}>Retry</Button>
        </ErrorCard>
      </Container>
    )
  }

  return (
    <Container data-testid="assignments-page">
      <Header data-testid="assignments-header">
        <Title>
          {state.user?.role === 'child'
            ? 'My Assignments'
            : 'Weekly Assignments'}
        </Title>
        <Filters>
          {/* Only show filter dropdown for parents */}
          {state.user?.role === 'parent' && (
            <Select
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
            >
              <option value="all">All Children</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </Select>
          )}

          {state.user?.role === 'parent' && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              data-testid="create-assignment-button"
            >
              Create Assignment
            </Button>
          )}
        </Filters>
      </Header>

      {filteredAssignments.length === 0 ? (
        <EmptyState data-testid="assignments-empty-state">
          <div className="icon">📋</div>
          <div className="title">No assignments found</div>
          <div className="subtitle">
            {assignments.length === 0
              ? 'Create weekly assignments to track chore completion.'
              : 'No assignments match your current filters.'}
          </div>
          {state.user?.role === 'parent' && assignments.length === 0 && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              data-testid="create-first-assignment-button"
            >
              Create Your First Assignment
            </Button>
          )}
        </EmptyState>
      ) : (
        <Table data-testid="assignments-table">
          <Thead>
            <Tr>
              <Th>Child</Th>
              <Th>Week</Th>
              <Th>Chores</Th>
              <Th>Status</Th>
              <Th>Notes</Th>
              {state.user?.role === 'parent' && <Th>Actions</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {filteredAssignments.map((assignment) => {
              const child = getUserById(assignment.childId)
              const endDate = assignment.endDate || 'Ongoing'
              const totalChores = assignment.chores?.length || 0
              const completedChores =
                assignment.chores?.filter((c) => c.status === 'completed')
                  .length || 0

              return (
                <Tr key={assignment.id} data-testid="assignment-row">
                  <Td data-testid="assignment-child-name">
                    {child?.name || 'Unknown'}
                  </Td>
                  <Td>
                    {formatDate(assignment.startDate)} -{' '}
                    {endDate !== 'Ongoing' ? formatDate(endDate) : endDate}
                  </Td>
                  <Td>
                    <ChoreTable>
                      <Tbody>
                        {assignment.chores?.map((assignmentChore) => (
                          <Tr key={assignmentChore.id} data-testid="chore-item">
                            <Td>
                              {assignmentChore.chore?.title || 'Unknown Chore'}
                              {assignmentChore.chore?.recurrenceDays &&
                                assignmentChore.chore.recurrenceDays.length >
                                  0 && (
                                  <span
                                    style={{ fontSize: '0.85em', opacity: 0.7 }}
                                  >
                                    {' '}
                                    (
                                    {assignmentChore.chore.recurrenceDays.join(
                                      ', ',
                                    )}
                                    )
                                  </span>
                                )}
                            </Td>
                            <Td>
                              <ChoreStatus
                                $status={assignmentChore.status}
                                data-testid="chore-status"
                              >
                                {assignmentChore.status}
                              </ChoreStatus>
                            </Td>
                            <Td>
                              {(state.user?.role === 'parent' ||
                                (state.user?.role === 'child' &&
                                  assignment.childId === state.user.id)) && (
                                <>
                                  <Button
                                    variant="secondary"
                                    onClick={() =>
                                      handleToggleChoreStatus(
                                        assignment.id,
                                        assignmentChore.choreId,
                                        assignmentChore.status,
                                      )
                                    }
                                    data-testid="toggle-chore-button"
                                  >
                                    {assignmentChore.status === 'completed'
                                      ? '✗'
                                      : '✓'}
                                  </Button>
                                  {state.user?.role === 'parent' && (
                                    <Button
                                      variant="secondary"
                                      onClick={() =>
                                        handleRemoveChoreFromAssignment(
                                          assignment,
                                          assignmentChore.choreId,
                                        )
                                      }
                                      data-testid="remove-chore-button"
                                      title="Remove chore from assignment"
                                    >
                                      🗑️
                                    </Button>
                                  )}
                                </>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </ChoreTable>
                  </Td>
                  <Td>
                    {completedChores}/{totalChores} completed
                  </Td>
                  <Td>{assignment.notes || '-'}</Td>
                  {state.user?.role === 'parent' && (
                    <Td>
                      <ActionButtons>
                        <Button
                          variant="secondary"
                          data-testid="edit-assignment-button"
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setIsEditModalOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          data-testid="delete-assignment-button"
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          Delete
                        </Button>
                      </ActionButtons>
                    </Td>
                  )}
                </Tr>
              )
            })}
          </Tbody>
        </Table>
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
    </Container>
  )
}

export default AssignmentsPage
