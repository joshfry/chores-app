import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DashboardPage from '../DashboardPage'
import { AuthProvider } from '../../../contexts/AuthContext'
import { api } from '../../../services/api'

jest.mock('../../../services/api')
const mockApi = api as jest.Mocked<typeof api>

const mockAuthContext = {
  state: {
    user: {
      id: 1,
      name: 'John Parent',
      email: 'john@test.com',
      role: 'parent' as const,
      familyId: 1,
      totalPoints: 100,
      isActive: true,
      createdBy: null,
      lastLogin: new Date().toISOString(),
      birthdate: null,
    },
    family: {
      id: 1,
      name: 'Smith Family',
      primaryParentId: 1,
      createdDate: new Date().toISOString(),
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
}

jest.mock('../../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../../contexts/AuthContext'),
  useAuth: () => mockAuthContext,
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('DashboardPage - Real Data Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display real user name from auth context, not hard-coded values', async () => {
    mockApi.getUsers.mockResolvedValue({ success: true, data: [] })
    mockApi.getChores.mockResolvedValue({ success: true, data: [] })
    mockApi.getAssignments.mockResolvedValue({ success: true, data: [] })
    mockApi.getDashboardStats.mockResolvedValue({
      success: true,
      data: {
        totalChildren: 0,
        totalChores: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        totalPointsEarned: 0,
      },
    })

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      const welcomeElement = screen.getByTestId('user-welcome')
      expect(welcomeElement).toHaveTextContent('Welcome back, John Parent!')
      expect(welcomeElement).not.toHaveTextContent('Welcome back, User!')
      expect(welcomeElement).not.toHaveTextContent('Welcome back, Parent!')
    })
  })

  it('should display real family name from auth context, not hard-coded values', async () => {
    mockApi.getUsers.mockResolvedValue({ success: true, data: [] })
    mockApi.getChores.mockResolvedValue({ success: true, data: [] })
    mockApi.getAssignments.mockResolvedValue({ success: true, data: [] })
    mockApi.getDashboardStats.mockResolvedValue({
      success: true,
      data: {
        totalChildren: 0,
        totalChores: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        totalPointsEarned: 0,
      },
    })

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      const familyElement = screen.getByTestId('family-name')
      expect(familyElement).toHaveTextContent('Smith Family')
      expect(familyElement).not.toHaveTextContent('Family Name')
      expect(familyElement).not.toHaveTextContent('My Family')
    })
  })

  it('should display real dashboard stats from API, not hard-coded values', async () => {
    const mockStats = {
      totalChildren: 3,
      totalChores: 15,
      totalAssignments: 42,
      completedAssignments: 28,
      pendingAssignments: 14,
      totalPointsEarned: 350,
    }

    mockApi.getUsers.mockResolvedValue({ success: true, data: [] })
    mockApi.getChores.mockResolvedValue({ success: true, data: [] })
    mockApi.getAssignments.mockResolvedValue({ success: true, data: [] })
    mockApi.getDashboardStats.mockResolvedValue({
      success: true,
      data: mockStats,
    })

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByTestId('stat-children-value')).toHaveTextContent('3')
      expect(screen.getByTestId('stat-chores-value')).toHaveTextContent('15')
      expect(screen.getByTestId('stat-assignments-value')).toHaveTextContent(
        '42',
      )
      expect(screen.getByTestId('stat-completed-value')).toHaveTextContent('28')
      expect(screen.getByTestId('stat-pending-value')).toHaveTextContent('14')
      expect(screen.getByTestId('stat-points-value')).toHaveTextContent('350')
    })

    // Verify NOT using hard-coded zero values
    expect(screen.getByTestId('stat-children-value')).not.toHaveTextContent('0')
    expect(screen.getByTestId('stat-chores-value')).not.toHaveTextContent('0')
  })

  it('should display real user data from API in family members list', async () => {
    const mockUsers = [
      {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@test.com',
        role: 'child' as const,
        totalPoints: 150,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
      {
        id: 2,
        name: 'Bob Johnson',
        email: 'bob@test.com',
        role: 'child' as const,
        totalPoints: 200,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2012-05-15',
      },
    ]

    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getChores.mockResolvedValue({ success: true, data: [] })
    mockApi.getAssignments.mockResolvedValue({ success: true, data: [] })
    mockApi.getDashboardStats.mockResolvedValue({
      success: true,
      data: {
        totalChildren: 2,
        totalChores: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        totalPointsEarned: 0,
      },
    })

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      const userNames = screen.getAllByTestId('dashboard-user-name')
      expect(userNames[0]).toHaveTextContent('Alice Johnson')
      expect(userNames[1]).toHaveTextContent('Bob Johnson')

      // Verify NOT using hard-coded names
      expect(userNames[0]).not.toHaveTextContent('User 1')
      expect(userNames[0]).not.toHaveTextContent('Child Name')
      expect(userNames[1]).not.toHaveTextContent('User 2')
    })
  })

  it('should display real assignment data from API', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Wash Dishes',
        description: 'Clean all dishes',
        difficulty: 'easy' as const,
        points: 10,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      },
    ]

    const mockUsers = [
      {
        id: 1,
        name: 'Charlie Kid',
        email: 'charlie@test.com',
        role: 'child' as const,
        totalPoints: 50,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2015-03-20',
      },
    ]

    const mockAssignments = [
      {
        id: 1,
        childId: 1,
        choreId: 1,
        assignedDate: '2025-09-25',
        dueDate: '2025-10-01',
        status: 'pending' as const,
        completedDate: null,
      },
    ]

    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })
    mockApi.getAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })
    mockApi.getDashboardStats.mockResolvedValue({
      success: true,
      data: {
        totalChildren: 1,
        totalChores: 1,
        totalAssignments: 1,
        completedAssignments: 0,
        pendingAssignments: 1,
        totalPointsEarned: 0,
      },
    })

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(
        screen.getByTestId('dashboard-assignment-title'),
      ).toHaveTextContent('Wash Dishes')
      expect(
        screen.getByTestId('dashboard-assignment-subtitle'),
      ).toHaveTextContent('Charlie Kid')

      // Verify NOT using hard-coded values
      expect(
        screen.getByTestId('dashboard-assignment-title'),
      ).not.toHaveTextContent('Assignment 1')
      expect(
        screen.getByTestId('dashboard-assignment-subtitle'),
      ).not.toHaveTextContent('Unknown Child')
    })
  })

  it('should display real weekly stats when available', async () => {
    const mockStats = {
      totalChildren: 2,
      totalChores: 5,
      totalAssignments: 10,
      completedAssignments: 6,
      pendingAssignments: 4,
      totalPointsEarned: 120,
      thisWeek: {
        assignmentsCompleted: 8,
        pointsEarned: 95,
      },
    }

    mockApi.getUsers.mockResolvedValue({ success: true, data: [] })
    mockApi.getChores.mockResolvedValue({ success: true, data: [] })
    mockApi.getAssignments.mockResolvedValue({ success: true, data: [] })
    mockApi.getDashboardStats.mockResolvedValue({
      success: true,
      data: mockStats,
    })

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      const weeklyStats = screen.getByTestId('weekly-stats')
      expect(weeklyStats).toBeInTheDocument()

      const weeklyCompleted = screen.getByTestId('weekly-completed')
      expect(weeklyCompleted).toHaveTextContent('8')

      const weeklyPoints = screen.getByTestId('weekly-points')
      expect(weeklyPoints).toHaveTextContent('95')
    })
  })

  it('should display real top performers data when available', async () => {
    const mockStats = {
      totalChildren: 2,
      totalChores: 5,
      totalAssignments: 10,
      completedAssignments: 6,
      pendingAssignments: 4,
      totalPointsEarned: 120,
      topPerformers: [
        { childId: 1, childName: 'Emma Star', pointsThisWeek: 75 },
        { childId: 2, childName: 'Liam Champion', pointsThisWeek: 60 },
      ],
    }

    mockApi.getUsers.mockResolvedValue({ success: true, data: [] })
    mockApi.getChores.mockResolvedValue({ success: true, data: [] })
    mockApi.getAssignments.mockResolvedValue({ success: true, data: [] })
    mockApi.getDashboardStats.mockResolvedValue({
      success: true,
      data: mockStats,
    })

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      const leaderboard = screen.getByTestId('leaderboard')
      expect(leaderboard).toBeInTheDocument()

      const performers = screen.getAllByTestId('top-performer')
      expect(performers).toHaveLength(2)
      expect(performers[0]).toHaveTextContent('Emma Star')
      expect(performers[0]).toHaveTextContent('75 points')
      expect(performers[1]).toHaveTextContent('Liam Champion')
      expect(performers[1]).toHaveTextContent('60 points')

      // Verify NOT using hard-coded names
      expect(performers[0]).not.toHaveTextContent('Top Child')
      expect(performers[0]).not.toHaveTextContent('Child 1')
    })
  })

  it('should show appropriate empty states with no hard-coded data', async () => {
    mockApi.getUsers.mockResolvedValue({ success: true, data: [] })
    mockApi.getChores.mockResolvedValue({ success: true, data: [] })
    mockApi.getAssignments.mockResolvedValue({ success: true, data: [] })
    mockApi.getDashboardStats.mockResolvedValue({
      success: true,
      data: {
        totalChildren: 0,
        totalChores: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        totalPointsEarned: 0,
      },
    })

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('No family members found')).toBeInTheDocument()
      expect(screen.getByText('No assignments yet')).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully without showing fake data', async () => {
    mockApi.getUsers.mockResolvedValue({
      success: false,
      error: 'Failed to fetch',
    })
    mockApi.getChores.mockResolvedValue({
      success: false,
      error: 'Failed to fetch',
    })
    mockApi.getAssignments.mockResolvedValue({
      success: false,
      error: 'Failed to fetch',
    })
    mockApi.getDashboardStats.mockResolvedValue({
      success: false,
      error: 'Network error',
    })

    renderWithRouter(<DashboardPage />)

    await waitFor(() => {
      const errorCard = screen.getByTestId('dashboard-error')
      expect(errorCard).toBeInTheDocument()
      expect(errorCard).toHaveTextContent('Network error')
    })
  })
})
