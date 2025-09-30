import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { User, Chore, Assignment, DashboardStats } from '../../types/api'

const Grid = styled.div``

const Card = styled.div``

const CardHeader = styled.div``

const CardTitle = styled.h3``

const CardValue = styled.div``

const CardSubtext = styled.div``

const StatsGrid = styled.div``

const StatCard = styled.div``

const StatValue = styled.div``

const StatLabel = styled.div``

const Section = styled.div``

const SectionHeader = styled.div``

const SectionTitle = styled.h2``

const Button = styled(Link)``

const List = styled.div``

const ListItem = styled.div``

const ItemInfo = styled.div``

const Badge = styled.span<{
  variant: 'success' | 'warning' | 'error' | 'info'
}>``

const LoadingCard = styled(Card)``

const ErrorCard = styled(Card)``

const WelcomeCard = styled(Card)``

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
      <Grid>
        <WelcomeCard>
          <CardTitle data-testid="user-welcome">
            Welcome back, {state.user?.name}! 👋
          </CardTitle>
          <CardSubtext data-testid="family-name">
            Here's what's happening with {state.family?.name} today.
          </CardSubtext>
        </WelcomeCard>
      </Grid>

      <StatsGrid data-testid="dashboard-stats">
        <StatCard data-testid="stat-members">
          <StatValue data-testid="stat-members-value">
            {stats?.totalChildren ?? activeUsers.length}
          </StatValue>
          <StatLabel>Family Members</StatLabel>
        </StatCard>

        <StatCard data-testid="stat-children">
          <StatValue data-testid="stat-children-value">
            {stats?.totalChildren ?? children.length}
          </StatValue>
          <StatLabel>Children</StatLabel>
        </StatCard>

        <StatCard data-testid="stat-chores">
          <StatValue data-testid="stat-chores-value">
            {stats?.totalChores ?? chores.length}
          </StatValue>
          <StatLabel>Total Chores</StatLabel>
        </StatCard>

        <StatCard data-testid="stat-assignments">
          <StatValue data-testid="stat-assignments-value">
            {stats?.totalAssignments ?? assignments.length}
          </StatValue>
          <StatLabel>Total Assignments</StatLabel>
        </StatCard>

        <StatCard data-testid="stat-completed">
          <StatValue data-testid="stat-completed-value">
            {stats?.completedAssignments ?? completedAssignments.length}
          </StatValue>
          <StatLabel>Completed</StatLabel>
        </StatCard>

        <StatCard data-testid="stat-pending">
          <StatValue data-testid="stat-pending-value">
            {stats?.pendingAssignments ?? pendingAssignments.length}
          </StatValue>
          <StatLabel>Pending</StatLabel>
        </StatCard>

        <StatCard data-testid="stat-points">
          <StatValue data-testid="stat-points-value">
            {stats?.totalPointsEarned ?? 0}
          </StatValue>
          <StatLabel>Total Points</StatLabel>
        </StatCard>
      </StatsGrid>

      {stats?.thisWeek && (
        <StatsGrid data-testid="weekly-stats">
          <StatCard data-testid="weekly-completed">
            <CardTitle>This Week's Completed</CardTitle>
            <CardValue>{stats.thisWeek.assignmentsCompleted}</CardValue>
            <CardSubtext>Assignments completed</CardSubtext>
          </StatCard>
          <StatCard data-testid="weekly-points">
            <CardTitle>This Week's Points</CardTitle>
            <CardValue>{stats.thisWeek.pointsEarned}</CardValue>
            <CardSubtext>Points earned by family</CardSubtext>
          </StatCard>
        </StatsGrid>
      )}

      {stats?.topPerformers?.length ? (
        <Section data-testid="leaderboard">
          <SectionHeader>
            <SectionTitle>Top Performers</SectionTitle>
          </SectionHeader>
          <List>
            {stats.topPerformers.map((performer: any) => (
              <ListItem key={performer.childId} data-testid="top-performer">
                <ItemInfo>
                  <div className="title">{performer.childName}</div>
                  <div className="subtitle">
                    {performer.pointsThisWeek} points earned this week
                  </div>
                </ItemInfo>
                <Badge variant="success">Star</Badge>
              </ListItem>
            ))}
          </List>
        </Section>
      ) : null}

      <Grid>
        <Card>
          <CardHeader>
            <CardTitle>Family Members</CardTitle>
            <Button to="/users" data-testid="manage-users-link">
              Manage Users
            </Button>
          </CardHeader>
          <List>
            {activeUsers.length > 0 ? (
              activeUsers.slice(0, 3).map((user) => (
                <ListItem key={user.id} data-testid="dashboard-user-item">
                  <ItemInfo>
                    <div className="title" data-testid="dashboard-user-name">
                      {user.name}
                    </div>
                    <div className="subtitle">
                      {user.role} • {user.totalPoints || 0} points
                    </div>
                  </ItemInfo>
                  <Badge
                    variant={user.role === 'parent' ? 'info' : 'success'}
                    data-testid="dashboard-user-role"
                  >
                    {user.role}
                  </Badge>
                </ListItem>
              ))
            ) : (
              <div>No family members found</div>
            )}
          </List>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <Button to="/assignments" data-testid="view-assignments-link">
              View All
            </Button>
          </CardHeader>
          <List>
            {recentAssignments.length > 0 ? (
              recentAssignments.map((assignment) => {
                const chore = chores.find((c) => c.id === assignment.choreId)
                const child = users.find((u) => u.id === assignment.childId)

                return (
                  <ListItem
                    key={assignment.id}
                    data-testid="dashboard-assignment-item"
                  >
                    <ItemInfo>
                      <div
                        className="title"
                        data-testid="dashboard-assignment-title"
                      >
                        {chore?.title || 'Unknown Chore'}
                      </div>
                      <div
                        className="subtitle"
                        data-testid="dashboard-assignment-subtitle"
                      >
                        Assigned to {child?.name || 'Unknown'} • Due{' '}
                        {assignment.dueDate}
                      </div>
                    </ItemInfo>
                    <Badge
                      variant={getAssignmentBadgeVariant(assignment.status)}
                      data-testid="dashboard-assignment-status"
                    >
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </ListItem>
                )
              })
            ) : (
              <div>No assignments yet</div>
            )}
          </List>
        </Card>
      </Grid>

      {error && (
        <ErrorCard data-testid="dashboard-error">
          <div>Error: {error}</div>
          <button onClick={() => window.location.reload()}>Retry</button>
        </ErrorCard>
      )}
    </div>
  )
}

export default DashboardPage
