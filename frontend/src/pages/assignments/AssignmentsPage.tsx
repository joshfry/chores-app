import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { Assignment, Chore, User } from '../../types/api'
import CreateAssignmentModal from './CreateAssignmentModal'
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

const Th = styled.th``

const Tbody = styled.tbody``

const Tr = styled.tr``

const Td = styled.td``

const Badge = styled.span<{
  variant: 'assigned' | 'in_progress' | 'completed' | 'missed' | 'overdue'
}>``

const AssignmentInfo = styled.div``

const UserInfo = styled.div``

const Avatar = styled.div``

const UserDetails = styled.div``

const Actions = styled.div``

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
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [childFilter, setChildFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

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
    choreId: number
    dueDate: string
    notes?: string
  }) => {
    await api.createAssignment(assignmentData)
    await fetchData()
  }

  const handleMarkComplete = async (assignmentId: number) => {
    try {
      await api.completeAssignment(assignmentId)
      await fetchData()
    } catch (err: any) {
      setError(err.message || 'Failed to complete assignment')
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

  const getChoreById = (choreId: number) => {
    return chores.find((chore) => chore.id === choreId)
  }

  const getUserById = (userId: number) => {
    return users.find((user) => user.id === userId)
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'completed' && new Date(dueDate) < new Date()
  }

  const getDisplayStatus = (
    assignment: Assignment,
  ): 'assigned' | 'in_progress' | 'completed' | 'missed' | 'overdue' => {
    if (isOverdue(assignment.dueDate, assignment.status)) {
      return 'overdue'
    }
    return assignment.status as
      | 'assigned'
      | 'in_progress'
      | 'completed'
      | 'missed'
  }

  const filteredAssignments = assignments.filter((assignment) => {
    if (statusFilter !== 'all' && assignment.status !== statusFilter) {
      return false
    }
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
        <Title>Assignments</Title>
        <Filters>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>

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

      <Card>
        {filteredAssignments.length === 0 ? (
          <EmptyState data-testid="assignments-empty-state">
            <div className="icon">📋</div>
            <div className="title">No assignments found</div>
            <div className="subtitle">
              {assignments.length === 0
                ? 'Start by creating assignments to track chore completion.'
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
                <Th>Chore</Th>
                <Th>Assigned To</Th>
                <Th>Assigned Date</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredAssignments.map((assignment) => {
                const chore = getChoreById(assignment.choreId)
                const child = getUserById(assignment.childId)
                const displayStatus = getDisplayStatus(assignment)

                return (
                  <Tr key={assignment.id} data-testid="assignment-row">
                    <Td>
                      <AssignmentInfo>
                        <div
                          className="chore-title"
                          data-testid="assignment-title"
                        >
                          {chore?.title || 'Unknown Chore'}
                        </div>
                        <div className="chore-points">
                          ⭐ {chore?.points || 0} points
                        </div>
                      </AssignmentInfo>
                    </Td>
                    <Td>
                      <UserInfo data-testid="assignment-user-info">
                        <Avatar>
                          {child?.name?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                        <UserDetails>
                          <div
                            className="name"
                            data-testid="assignment-user-name"
                          >
                            {child?.name || 'Unknown User'}
                          </div>
                        </UserDetails>
                      </UserInfo>
                    </Td>
                    <Td>{formatDate(assignment.assignedDate)}</Td>
                    <Td>{formatDate(assignment.dueDate)}</Td>
                    <Td>
                      <Badge
                        variant={displayStatus}
                        data-testid="assignment-status"
                      >
                        {displayStatus === 'in_progress'
                          ? 'In Progress'
                          : displayStatus.charAt(0).toUpperCase() +
                            displayStatus.slice(1)}
                      </Badge>
                    </Td>
                    <Td>
                      <Actions>
                        {assignment.status !== 'completed' &&
                          state.user?.role === 'child' &&
                          assignment.childId === state.user.id && (
                            <Button
                              variant="secondary"
                              data-testid="mark-complete-button"
                              onClick={() => handleMarkComplete(assignment.id)}
                            >
                              Complete
                            </Button>
                          )}
                        {state.user?.role === 'parent' && (
                          <>
                            {assignment.status !== 'completed' && (
                              <Button
                                variant="secondary"
                                data-testid="mark-done-button"
                                onClick={() =>
                                  handleMarkComplete(assignment.id)
                                }
                              >
                                Mark Done
                              </Button>
                            )}
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
                          </>
                        )}
                      </Actions>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        )}
      </Card>

      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        children={children}
        chores={chores}
        onSubmit={handleCreateAssignment}
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
