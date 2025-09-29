import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { User, Chore, Assignment } from '../../types/api'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`

const CardHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
`

const CardSubtext = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  border: 1px solid #e5e7eb;
`

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
`

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`

const Section = styled.div`
  margin-bottom: 2rem;
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`

const Button = styled(Link)`
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #5a67d8;
  }
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const ListItem = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ItemInfo = styled.div`
  .title {
    font-weight: 500;
    color: #1f2937;
  }

  .subtitle {
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
`

const Badge = styled.span<{
  variant: 'success' | 'warning' | 'error' | 'info'
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) => {
    switch (props.variant) {
      case 'success':
        return 'background: #dcfce7; color: #16a34a;'
      case 'warning':
        return 'background: #fef3c7; color: #d97706;'
      case 'error':
        return 'background: #fee2e2; color: #dc2626;'
      default:
        return 'background: #eff6ff; color: #2563eb;'
    }
  }}
`

const LoadingCard = styled(Card)`
  text-align: center;
  color: #6b7280;
  padding: 3rem 1.5rem;
`

const ErrorCard = styled(Card)`
  text-align: center;
  color: #dc2626;
  background: #fef2f2;
  border-color: #fecaca;
`

const WelcomeCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  ${CardTitle} {
    color: white;
  }

  ${CardSubtext} {
    color: rgba(255, 255, 255, 0.8);
  }
`

const DashboardPage: React.FC = () => {
  const { state } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      } catch (err) {
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
      <div>
        <LoadingCard>
          <div>Loading dashboard...</div>
        </LoadingCard>
      </div>
    )
  }

  const activeUsers = users.filter((user) => user.isActive)
  const children = activeUsers.filter((user) => user.role === 'child')
  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === 'completed',
  )
  const pendingAssignments = assignments.filter(
    (assignment) => assignment.status === 'pending',
  )

  const recentAssignments = assignments.slice(-5)

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
    <div>
      {/* Welcome Section */}
      <Grid style={{ marginBottom: '2rem' }}>
        <WelcomeCard>
          <CardTitle>Welcome back, {state.user?.name}! 👋</CardTitle>
          <CardSubtext style={{ marginTop: '0.5rem' }}>
            Here's what's happening with {state.family?.name} today.
          </CardSubtext>
        </WelcomeCard>
      </Grid>

      {/* Stats Overview */}
      <StatsGrid>
        <StatCard>
          <StatValue>{activeUsers.length}</StatValue>
          <StatLabel>Family Members</StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{children.length}</StatValue>
          <StatLabel>Children</StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{chores.length}</StatValue>
          <StatLabel>Total Chores</StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{completedAssignments.length}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{pendingAssignments.length}</StatValue>
          <StatLabel>Pending</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Quick Actions */}
      <Grid>
        <Card>
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
            <Button to="/dashboard/users">Manage Users</Button>
          </CardHeader>
          <List>
            {activeUsers.length > 0 ? (
              activeUsers.slice(0, 3).map((user) => (
                <ListItem key={user.id}>
                  <ItemInfo>
                    <div className="title">{user.name}</div>
                    <div className="subtitle">
                      {user.role} • {user.totalPoints || 0} points
                    </div>
                  </ItemInfo>
                  <Badge variant={user.role === 'parent' ? 'info' : 'success'}>
                    {user.role}
                  </Badge>
                </ListItem>
              ))
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '1rem',
                }}
              >
                No family members found
              </div>
            )}
          </List>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <Button to="/dashboard/assignments">View All</Button>
          </CardHeader>
          <List>
            {recentAssignments.length > 0 ? (
              recentAssignments.map((assignment) => {
                const chore = chores.find((c) => c.id === assignment.choreId)
                const child = users.find((u) => u.id === assignment.childId)

                return (
                  <ListItem key={assignment.id}>
                    <ItemInfo>
                      <div className="title">
                        {chore?.title || 'Unknown Chore'}
                      </div>
                      <div className="subtitle">
                        Assigned to {child?.name || 'Unknown'} • Due{' '}
                        {assignment.dueDate}
                      </div>
                    </ItemInfo>
                    <Badge
                      variant={getAssignmentBadgeVariant(assignment.status)}
                    >
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </ListItem>
                )
              })
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '1rem',
                }}
              >
                No assignments yet
              </div>
            )}
          </List>
        </Card>
      </Grid>

      {error && (
        <ErrorCard>
          <div>Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </ErrorCard>
      )}
    </div>
  )
}

export default DashboardPage
