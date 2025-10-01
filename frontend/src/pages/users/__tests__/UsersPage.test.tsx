import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import UsersPage from '../UsersPage'
import { api } from '../../../services/api'

jest.mock('../../../services/api')
const mockApi = api as jest.Mocked<typeof api>

const mockAuthContext = {
  state: {
    user: {
      id: 1,
      name: 'Parent User',
      email: 'parent@test.com',
      role: 'parent' as const,
      familyId: 1,
      totalPoints: 0,
      isActive: true,
      createdBy: null,
      lastLogin: new Date().toISOString(),
      birthdate: null,
    },
    family: {
      id: 1,
      name: 'Test Family',
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

describe('UsersPage - Real Data Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display real user data from API, not hard-coded values', async () => {
    const mockUsers = [
      {
        id: 1,
        name: 'Sarah Martinez',
        email: 'sarah@test.com',
        role: 'parent' as const,
        totalPoints: 0,
        isActive: true,
        familyId: 1,
        createdBy: null,
        lastLogin: '2025-09-20T10:00:00Z',
        birthdate: '1985-05-15',
      },
      {
        id: 2,
        name: 'Miguel Rodriguez',
        email: 'miguel@test.com',
        role: 'child' as const,
        totalPoints: 250,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: '2025-09-29T15:30:00Z',
        birthdate: '2012-08-22',
      },
      {
        id: 3,
        name: 'Sofia Rodriguez',
        email: 'sofia@test.com',
        role: 'child' as const,
        totalPoints: 180,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: '2025-09-28T12:00:00Z',
        birthdate: '2015-03-10',
      },
    ]

    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })

    renderWithRouter(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('Sarah Martinez')).toBeInTheDocument()
      expect(screen.getByText('Miguel Rodriguez')).toBeInTheDocument()
      expect(screen.getByText('Sofia Rodriguez')).toBeInTheDocument()
    })

    // Verify emails are real
    expect(screen.getByText('sarah@test.com')).toBeInTheDocument()
    expect(screen.getByText('miguel@test.com')).toBeInTheDocument()
    expect(screen.getByText('sofia@test.com')).toBeInTheDocument()

    // Verify NOT using hard-coded names
    expect(screen.queryByText('User 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Child Name')).not.toBeInTheDocument()
    expect(screen.queryByText('Test User')).not.toBeInTheDocument()
  })

  it('should display real points data from API, not hard-coded values', async () => {
    const mockUsers = [
      {
        id: 1,
        name: 'High Scorer',
        email: 'high@test.com',
        role: 'child' as const,
        totalPoints: 500,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
      {
        id: 2,
        name: 'Medium Scorer',
        email: 'medium@test.com',
        role: 'child' as const,
        totalPoints: 250,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2012-05-15',
      },
      {
        id: 3,
        name: 'Low Scorer',
        email: 'low@test.com',
        role: 'child' as const,
        totalPoints: 50,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2015-08-20',
      },
    ]

    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })

    renderWithRouter(<UsersPage />)

    await waitFor(() => {
      const tableRows = screen.getAllByRole('row')
      // Header row + 3 user rows
      expect(tableRows).toHaveLength(4)
    })

    // Check that real point values are displayed
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('250')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()

    // Verify NOT all zeros
    const pointCells = screen.getAllByText(/^\d+$/)
    const allZeros = pointCells.every((cell) => cell.textContent === '0')
    expect(allZeros).toBe(false)
  })

  it('should display real role data from API', async () => {
    const mockUsers = [
      {
        id: 1,
        name: 'Parent One',
        email: 'parent1@test.com',
        role: 'parent' as const,
        totalPoints: 0,
        isActive: true,
        familyId: 1,
        createdBy: null,
        lastLogin: new Date().toISOString(),
        birthdate: null,
      },
      {
        id: 2,
        name: 'Child One',
        email: 'child1@test.com',
        role: 'child' as const,
        totalPoints: 100,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
    ]

    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })

    renderWithRouter(<UsersPage />)

    await waitFor(() => {
      const roleBadges = screen.getAllByText(/^(parent|child)$/)
      expect(roleBadges).toHaveLength(2)
      expect(roleBadges[0]).toHaveTextContent('parent')
      expect(roleBadges[1]).toHaveTextContent('child')
    })
  })

  it('should display real active status from API', async () => {
    const mockUsers = [
      {
        id: 1,
        name: 'Active User',
        email: 'active@test.com',
        role: 'child' as const,
        totalPoints: 100,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
      {
        id: 2,
        name: 'Inactive User',
        email: 'inactive@test.com',
        role: 'child' as const,
        totalPoints: 50,
        isActive: false,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2012-05-15',
      },
    ]

    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })

    renderWithRouter(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })
  })

  it('should display real last login dates from API', async () => {
    const recentDate = new Date('2025-09-29T10:00:00Z')
    const oldDate = new Date('2025-08-01T10:00:00Z')

    const mockUsers = [
      {
        id: 1,
        name: 'Recent User',
        email: 'recent@test.com',
        role: 'child' as const,
        totalPoints: 100,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: recentDate.toISOString(),
        birthdate: '2010-01-01',
      },
      {
        id: 2,
        name: 'Old User',
        email: 'old@test.com',
        role: 'child' as const,
        totalPoints: 50,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: oldDate.toISOString(),
        birthdate: '2012-05-15',
      },
      {
        id: 3,
        name: 'Never Logged In',
        email: 'never@test.com',
        role: 'child' as const,
        totalPoints: 0,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: null,
        birthdate: '2015-03-10',
      },
    ]

    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })

    renderWithRouter(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('Sep 29, 2025')).toBeInTheDocument()
      expect(screen.getByText('Aug 1, 2025')).toBeInTheDocument()
      expect(screen.getByText('Never')).toBeInTheDocument()
    })
  })

  it('should display user avatars with real initials from names', async () => {
    const mockUsers = [
      {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@test.com',
        role: 'child' as const,
        totalPoints: 100,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
      {
        id: 2,
        name: 'Bob Smith',
        email: 'bob@test.com',
        role: 'child' as const,
        totalPoints: 50,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2012-05-15',
      },
    ]

    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })

    renderWithRouter(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
    })
  })

  it('should show empty state when no users exist (no fake data)', async () => {
    mockApi.getUsers.mockResolvedValue({ success: true, data: [] })

    renderWithRouter(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('No family members found')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Start by adding child accounts to manage chores together.',
        ),
      ).toBeInTheDocument()
    })

    // Verify table is not shown with fake data
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('should handle API errors without showing fake data', async () => {
    mockApi.getUsers.mockResolvedValue({
      success: false,
      error: 'Database connection failed',
    })

    renderWithRouter(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText(/Database connection failed/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    // Verify no user data is shown
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText('Test User')).not.toBeInTheDocument()
  })

  it('should display loading state without showing fake data', async () => {
    mockApi.getUsers.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderWithRouter(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('Loading users...')).toBeInTheDocument()
    })

    // Verify no data is shown while loading
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('should verify no hard-coded user data in table rows', async () => {
    const uniqueUsers = [
      {
        id: 99,
        name: 'Unique Name Alpha',
        email: 'unique.alpha@test.com',
        role: 'child' as const,
        totalPoints: 789,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
      {
        id: 100,
        name: 'Unique Name Beta',
        email: 'unique.beta@test.com',
        role: 'parent' as const,
        totalPoints: 456,
        isActive: false,
        familyId: 1,
        createdBy: null,
        lastLogin: new Date().toISOString(),
        birthdate: '1980-12-25',
      },
    ]

    mockApi.getUsers.mockResolvedValue({ success: true, data: uniqueUsers })

    renderWithRouter(<UsersPage />)

    await waitFor(() => {
      expect(screen.getByText('Unique Name Alpha')).toBeInTheDocument()
      expect(screen.getByText('Unique Name Beta')).toBeInTheDocument()
      expect(screen.getByText('unique.alpha@test.com')).toBeInTheDocument()
      expect(screen.getByText('unique.beta@test.com')).toBeInTheDocument()
      expect(screen.getByText('789')).toBeInTheDocument()
      expect(screen.getByText('456')).toBeInTheDocument()
    })

    // Common hard-coded values that should NOT appear
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument()
    expect(screen.queryByText('Test Child')).not.toBeInTheDocument()
    expect(screen.queryByText('Sample User')).not.toBeInTheDocument()
  })
})
