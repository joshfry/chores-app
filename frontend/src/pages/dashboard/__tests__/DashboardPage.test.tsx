import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DashboardPage from '../DashboardPage'
import { api } from '../../../services/api'

// Mock the API
jest.mock('../../../services/api')

// Mock the AuthContext to return our test data
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    state: {
      user: {
        id: 1,
        email: 'parent@example.com',
        name: 'Test Parent',
        role: 'parent' as const,
        familyId: 1,
        birthdate: '1980-01-01',
        createdBy: null,
        lastLogin: new Date().toISOString(),
        isActive: true,
      },
      family: {
        id: 1,
        name: 'Test Family',
        createdDate: new Date().toISOString(),
        primaryParentId: 1,
      },
      isAuthenticated: true,
      isLoading: false,
    },
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn(),
    verifyMagicToken: jest.fn(),
    updateCurrentUser: jest.fn(),
    clearError: jest.fn(),
    refreshUser: jest.fn(),
  }),
}))

const mockUsers = [
  {
    id: 1,
    email: 'parent@example.com',
    name: 'Test Parent',
    role: 'parent' as const,
    familyId: 1,
    birthdate: '1980-01-01',
    createdBy: null,
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 2,
    email: 'child@example.com',
    name: 'Test Child',
    role: 'child' as const,
    familyId: 1,
    birthdate: '2010-01-01',
    createdBy: 1,
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
]

const mockChores = [
  {
    id: 1,
    title: 'Test Chore',
    description: 'Test description',
    difficulty: 'easy' as const,
    isRecurring: false,
    familyId: 1,
  },
]

const mockAssignments = [
  {
    id: 1,
    childId: 2,
    startDate: '2025-09-28',
    endDate: '2025-10-04',
    status: 'completed' as const,
    chores: [],
  },
  {
    id: 2,
    childId: 2,
    startDate: '2025-09-28',
    endDate: '2025-10-04',
    status: 'assigned' as const,
    chores: [],
  },
]

const mockStats = {
  totalChildren: 1,
  totalChores: 1,
  totalAssignments: 10,
  completedAssignments: 7,
  pendingAssignments: 3,
  thisWeek: {
    assignmentsCompleted: 2,
  },
  topPerformers: [
    {
      childId: 2,
      childName: 'Test Child',
      choresCompleted: 5,
    },
  ],
}

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.getUsers as jest.Mock).mockResolvedValue({
      success: true,
      data: mockUsers,
    })
    ;(api.getChores as jest.Mock).mockResolvedValue({
      success: true,
      data: mockChores,
    })
    ;(api.getAssignments as jest.Mock).mockResolvedValue({
      success: true,
      data: mockAssignments,
    })
    ;(api.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: mockStats,
    })
  })

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>,
    )
  }

  it('displays progress bar with correct completion data', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('progress-card')).toBeInTheDocument()
    })

    const progressBar = screen.getByTestId(
      'assignment-progress-bar',
    ) as HTMLProgressElement
    expect(progressBar).toBeInTheDocument()
    expect(progressBar.value).toBe(7)
    expect(progressBar.max).toBe(10)

    const progressLabel = screen.getByTestId('progress-label')
    expect(progressLabel).toHaveTextContent('7 of 10 assignments completed')
    expect(progressLabel).toHaveTextContent('(70%)')
  })

  it('does not display progress bar when no assignments exist', async () => {
    ;(api.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ...mockStats,
        totalAssignments: 0,
        completedAssignments: 0,
      },
    })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-stats')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('progress-card')).not.toBeInTheDocument()
  })

  it('calculates progress percentage correctly', async () => {
    ;(api.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ...mockStats,
        totalAssignments: 3,
        completedAssignments: 1,
      },
    })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('progress-label')).toBeInTheDocument()
    })

    const progressLabel = screen.getByTestId('progress-label')
    expect(progressLabel).toHaveTextContent('1 of 3 assignments completed')
    expect(progressLabel).toHaveTextContent('(33%)')
  })

  it('shows 100% completion when all assignments are complete', async () => {
    ;(api.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ...mockStats,
        totalAssignments: 5,
        completedAssignments: 5,
      },
    })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('progress-label')).toBeInTheDocument()
    })

    const progressLabel = screen.getByTestId('progress-label')
    expect(progressLabel).toHaveTextContent('5 of 5 assignments completed')
    expect(progressLabel).toHaveTextContent('(100%)')
  })

  it('displays welcome message with user name', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('user-welcome')).toBeInTheDocument()
    })

    expect(screen.getByTestId('user-welcome')).toHaveTextContent(
      'Welcome back, Test Parent!',
    )
  })

  it('displays family name', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('family-name')).toBeInTheDocument()
    })

    expect(screen.getByTestId('family-name')).toHaveTextContent('Test Family')
  })

  it('displays dashboard stats correctly', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByTestId('stat-children-value')).toHaveTextContent('1')
    })

    expect(screen.getByTestId('stat-chores-value')).toHaveTextContent('1')
    expect(screen.getByTestId('stat-assignments-value')).toHaveTextContent('10')
    expect(screen.getByTestId('stat-completed-value')).toHaveTextContent('7')
    expect(screen.getByTestId('stat-pending-value')).toHaveTextContent('3')
  })
})
