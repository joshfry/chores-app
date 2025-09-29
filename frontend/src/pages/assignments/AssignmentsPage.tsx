import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { Assignment, Chore, User } from '../../types/api'

const Container = styled.div`
  max-width: 1200px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${(props) =>
    props.variant === 'secondary'
      ? `
    background: white;
    border: 1px solid #d1d5db;
    color: #374151;
    
    &:hover {
      background: #f9fafb;
    }
  `
      : `
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a67d8;
    }
  `}
`

const Card = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Thead = styled.thead`
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`

const Tbody = styled.tbody``

const Tr = styled.tr`
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9fafb;
  }
`

const Td = styled.td`
  padding: 1rem;
  color: #1f2937;
`

const Badge = styled.span<{
  variant: 'pending' | 'in_progress' | 'completed' | 'overdue'
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) => {
    switch (props.variant) {
      case 'completed':
        return 'background: #dcfce7; color: #16a34a;'
      case 'in_progress':
        return 'background: #fef3c7; color: #d97706;'
      case 'overdue':
        return 'background: #fee2e2; color: #dc2626;'
      case 'pending':
        return 'background: #eff6ff; color: #2563eb;'
      default:
        return 'background: #f3f4f6; color: #374151;'
    }
  }}
`

const AssignmentInfo = styled.div`
  .chore-title {
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .chore-points {
    color: #667eea;
    font-size: 0.875rem;
    font-weight: 500;
  }
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
`

const UserDetails = styled.div`
  .name {
    font-weight: 500;
    color: #1f2937;
    font-size: 0.875rem;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const LoadingCard = styled(Card)`
  padding: 3rem;
  text-align: center;
  color: #6b7280;
`

const ErrorCard = styled(Card)`
  padding: 2rem;
  text-align: center;
  color: #dc2626;
  background: #fef2f2;
  border-color: #fecaca;
`

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #6b7280;

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .title {
    font-size: 1.125rem;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    margin-bottom: 1.5rem;
  }
`

const AssignmentsPage: React.FC = () => {
  const { state } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [childFilter, setChildFilter] = useState<string>('all')

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

  const handleCreateAssignment = () => {
    // TODO: Implement create assignment modal/form
    console.log('Create assignment clicked')
  }

  const handleMarkComplete = (assignmentId: number) => {
    // TODO: Implement mark as complete
    console.log('Mark complete:', assignmentId)
  }

  const handleDeleteAssignment = (assignmentId: number) => {
    // TODO: Implement delete assignment
    console.log('Delete assignment:', assignmentId)
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

  const getDisplayStatus = (assignment: Assignment) => {
    if (isOverdue(assignment.dueDate, assignment.status)) {
      return 'overdue'
    }
    return assignment.status
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
      <Container>
        <LoadingCard>Loading assignments...</LoadingCard>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <ErrorCard>
          <div>Error: {error}</div>
          <Button onClick={fetchData} style={{ marginTop: '1rem' }}>
            Retry
          </Button>
        </ErrorCard>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>Assignments</Title>
        <Filters>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
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
            <Button onClick={handleCreateAssignment}>Create Assignment</Button>
          )}
        </Filters>
      </Header>

      <Card>
        {filteredAssignments.length === 0 ? (
          <EmptyState>
            <div className="icon">📋</div>
            <div className="title">No assignments found</div>
            <div className="subtitle">
              {assignments.length === 0
                ? 'Start by creating assignments to track chore completion.'
                : 'No assignments match your current filters.'}
            </div>
            {state.user?.role === 'parent' && assignments.length === 0 && (
              <Button onClick={handleCreateAssignment}>
                Create Your First Assignment
              </Button>
            )}
          </EmptyState>
        ) : (
          <Table>
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
                  <Tr key={assignment.id}>
                    <Td>
                      <AssignmentInfo>
                        <div className="chore-title">
                          {chore?.title || 'Unknown Chore'}
                        </div>
                        <div className="chore-points">
                          ⭐ {chore?.points || 0} points
                        </div>
                      </AssignmentInfo>
                    </Td>
                    <Td>
                      <UserInfo>
                        <Avatar>
                          {child?.name?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                        <UserDetails>
                          <div className="name">
                            {child?.name || 'Unknown User'}
                          </div>
                        </UserDetails>
                      </UserInfo>
                    </Td>
                    <Td>{formatDate(assignment.assignedDate)}</Td>
                    <Td>{formatDate(assignment.dueDate)}</Td>
                    <Td>
                      <Badge variant={displayStatus}>
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
                                onClick={() =>
                                  handleMarkComplete(assignment.id)
                                }
                              >
                                Mark Done
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              onClick={() =>
                                handleDeleteAssignment(assignment.id)
                              }
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
    </Container>
  )
}

export default AssignmentsPage
