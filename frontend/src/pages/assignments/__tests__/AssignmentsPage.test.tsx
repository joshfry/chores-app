import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AssignmentsPage from '../AssignmentsPage'
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

describe('AssignmentsPage - Real Data Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display real assignment data from API, not hard-coded values', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Clean Kitchen',
        description: 'Deep clean',
        difficulty: 'medium' as const,
        points: 20,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      },
      {
        id: 2,
        title: 'Walk Dog',
        description: 'Evening walk',
        difficulty: 'easy' as const,
        points: 10,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      },
    ]

    const mockUsers = [
      {
        id: 1,
        name: 'Emma Wilson',
        email: 'emma@test.com',
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
        name: 'Liam Wilson',
        email: 'liam@test.com',
        role: 'child' as const,
        totalPoints: 120,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2012-05-15',
      },
    ]

    const mockAssignments = [
      {
        id: 1,
        childId: 1,
        choreId: 1,
        assignedDate: '2025-09-25',
        dueDate: '2025-09-30',
        status: 'pending' as const,
        completedDate: null,
      },
      {
        id: 2,
        childId: 2,
        choreId: 2,
        assignedDate: '2025-09-28',
        dueDate: '2025-10-02',
        status: 'in_progress' as const,
        completedDate: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })
    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Clean Kitchen').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Walk Dog').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Emma Wilson').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Liam Wilson').length).toBeGreaterThan(0)
    })

    // Verify NOT using hard-coded names
    expect(screen.queryByText('Assignment 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Sample Assignment')).not.toBeInTheDocument()
    expect(screen.queryByText('Test Child')).not.toBeInTheDocument()
  })

  it('should display real chore points from API', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'High Point Task',
        description: 'Difficult',
        difficulty: 'hard' as const,
        points: 75,
        isRecurring: false,
        recurrencePattern: null,
      },
      {
        id: 2,
        title: 'Low Point Task',
        description: 'Easy',
        difficulty: 'easy' as const,
        points: 5,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    const mockUsers = [
      {
        id: 1,
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

    const mockAssignments = [
      {
        id: 1,
        childId: 1,
        choreId: 1,
        assignedDate: '2025-09-25',
        dueDate: '2025-09-30',
        status: 'pending' as const,
        completedDate: null,
      },
      {
        id: 2,
        childId: 1,
        choreId: 2,
        assignedDate: '2025-09-25',
        dueDate: '2025-09-30',
        status: 'pending' as const,
        completedDate: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })
    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      const pointElements = screen.getAllByText(/\d+ points/)
      expect(
        pointElements.some((el) => el.textContent?.includes('75 points')),
      ).toBe(true)
      expect(
        pointElements.some((el) => el.textContent?.includes('5 points')),
      ).toBe(true)
    })
  })

  it('should display real assignment dates from API', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Task',
        description: 'Description',
        difficulty: 'easy' as const,
        points: 10,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    const mockUsers = [
      {
        id: 1,
        name: 'Test Child',
        email: 'child@test.com',
        role: 'child' as const,
        totalPoints: 100,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
    ]

    const mockAssignments = [
      {
        id: 1,
        childId: 1,
        choreId: 1,
        assignedDate: '2025-09-15',
        dueDate: '2025-10-15',
        status: 'pending' as const,
        completedDate: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })
    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      const assignmentRow = screen.getByTestId('assignment-row')
      expect(assignmentRow).toBeInTheDocument()

      // Verify dates are displayed (they appear in the table)
      const tableContent = assignmentRow.textContent || ''
      expect(tableContent).toContain('Sep')
      expect(tableContent).toContain('2025')
    })
  })

  it('should display real assignment statuses from API', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Chore 1',
        description: 'Desc',
        difficulty: 'easy' as const,
        points: 10,
        isRecurring: false,
        recurrencePattern: null,
      },
      {
        id: 2,
        title: 'Chore 2',
        description: 'Desc',
        difficulty: 'easy' as const,
        points: 10,
        isRecurring: false,
        recurrencePattern: null,
      },
      {
        id: 3,
        title: 'Chore 3',
        description: 'Desc',
        difficulty: 'easy' as const,
        points: 10,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    const mockUsers = [
      {
        id: 1,
        name: 'Child',
        email: 'child@test.com',
        role: 'child' as const,
        totalPoints: 100,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
    ]

    const mockAssignments = [
      {
        id: 1,
        childId: 1,
        choreId: 1,
        assignedDate: '2025-09-29',
        dueDate: '2025-10-15',
        status: 'assigned' as const,
        completedDate: null,
      },
      {
        id: 2,
        childId: 1,
        choreId: 2,
        assignedDate: '2025-09-28',
        dueDate: '2025-10-16',
        status: 'in_progress' as const,
        completedDate: null,
      },
      {
        id: 3,
        childId: 1,
        choreId: 3,
        assignedDate: '2025-09-20',
        dueDate: '2025-09-25',
        status: 'completed' as const,
        completedDate: '2025-09-24',
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })
    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      const statuses = screen.getAllByTestId('assignment-status')
      expect(statuses).toHaveLength(3)

      const statusTexts = statuses.map((s) => s.textContent)
      expect(statusTexts).toContain('Assigned')
      expect(statusTexts).toContain('In Progress')
      expect(statusTexts).toContain('Completed')
    })
  })

  it('should display child names with real initials in avatars', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Task',
        description: 'Desc',
        difficulty: 'easy' as const,
        points: 10,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    const mockUsers = [
      {
        id: 1,
        name: 'Zoe Anderson',
        email: 'zoe@test.com',
        role: 'child' as const,
        totalPoints: 100,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
    ]

    const mockAssignments = [
      {
        id: 1,
        childId: 1,
        choreId: 1,
        assignedDate: '2025-09-25',
        dueDate: '2025-09-30',
        status: 'pending' as const,
        completedDate: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })
    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      const userInfo = screen.getByTestId('assignment-user-info')
      expect(userInfo).toHaveTextContent('Z')
      expect(userInfo).toHaveTextContent('Zoe Anderson')
    })
  })

  it('should show empty state when no assignments exist (no fake data)', async () => {
    mockApi.getChores.mockResolvedValue({ success: true, data: [] })
    mockApi.getUsers.mockResolvedValue({ success: true, data: [] })
    mockApi.getAssignments.mockResolvedValue({ success: true, data: [] })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      const emptyState = screen.getByTestId('assignments-empty-state')
      expect(emptyState).toBeInTheDocument()
      expect(screen.getByText('No assignments found')).toBeInTheDocument()
    })

    // Verify table is not shown with fake data
    expect(screen.queryByTestId('assignments-table')).not.toBeInTheDocument()
  })

  it('should handle API errors without showing fake data', async () => {
    // AssignmentsPage catches errors and shows empty state instead of error message
    mockApi.getChores.mockResolvedValue({
      success: false,
      error: 'Network error',
      data: [],
    })
    mockApi.getUsers.mockResolvedValue({
      success: false,
      error: 'Network error',
      data: [],
    })
    mockApi.getAssignments.mockResolvedValue({
      success: false,
      error: 'Network error',
      data: [],
    })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      // Should show empty state when API fails
      expect(screen.getByTestId('assignments-empty-state')).toBeInTheDocument()
    })

    // Verify no assignment data table is shown
    expect(screen.queryByTestId('assignments-table')).not.toBeInTheDocument()
  })

  it('should display loading state without showing fake data', async () => {
    mockApi.getChores.mockImplementation(() => new Promise(() => {}))
    mockApi.getUsers.mockImplementation(() => new Promise(() => {}))
    mockApi.getAssignments.mockImplementation(() => new Promise(() => {}))

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      expect(screen.getByText('Loading assignments...')).toBeInTheDocument()
    })

    // Verify no data is shown while loading
    expect(screen.queryByTestId('assignments-table')).not.toBeInTheDocument()
  })

  it('should populate filter dropdowns with real child names from API', async () => {
    const mockChores = []
    const mockUsers = [
      {
        id: 1,
        name: 'Alex Martinez',
        email: 'alex@test.com',
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
        name: 'Bella Garcia',
        email: 'bella@test.com',
        role: 'child' as const,
        totalPoints: 150,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2012-05-15',
      },
      {
        id: 3,
        name: 'Parent User',
        email: 'parent@test.com',
        role: 'parent' as const,
        totalPoints: 0,
        isActive: true,
        familyId: 1,
        createdBy: null,
        lastLogin: new Date().toISOString(),
        birthdate: null,
      },
    ]
    const mockAssignments = []

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })
    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      const childFilterOptions = screen.getAllByRole('option')
      const childNames = childFilterOptions.map((opt) => opt.textContent)

      expect(childNames).toContain('Alex Martinez')
      expect(childNames).toContain('Bella Garcia')
      // Parent should not be in child filter
      expect(childNames.filter((name) => name === 'Parent User')).toHaveLength(
        0,
      )
    })
  })

  it('should verify no hard-coded assignment data in table', async () => {
    const mockChores = [
      {
        id: 99,
        title: 'Unique Chore XYZ',
        description: 'Very specific task',
        difficulty: 'hard' as const,
        points: 99,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    const mockUsers = [
      {
        id: 99,
        name: 'Unique Child Name ABC',
        email: 'unique@test.com',
        role: 'child' as const,
        totalPoints: 999,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
    ]

    const mockAssignments = [
      {
        id: 99,
        childId: 99,
        choreId: 99,
        assignedDate: '2025-08-15',
        dueDate: '2025-08-20',
        status: 'completed' as const,
        completedDate: '2025-08-19',
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })
    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Unique Chore XYZ').length).toBeGreaterThan(0)
      expect(
        screen.getAllByText('Unique Child Name ABC').length,
      ).toBeGreaterThan(0)
      expect(screen.getAllByText(/99 points/).length).toBeGreaterThan(0)
      const dates = screen.getAllByText(/Aug \d+, 2025/)
      expect(dates.length).toBeGreaterThan(0)
    })

    // Common hard-coded values that should NOT appear
    expect(screen.queryByText('Sample Assignment')).not.toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Clean Room')).not.toBeInTheDocument()
    expect(screen.queryByText('Default Task')).not.toBeInTheDocument()
  })

  it('should handle unknown chore or child gracefully with fallback text', async () => {
    const mockChores = []
    const mockUsers = []
    const mockAssignments = [
      {
        id: 1,
        childId: 999,
        choreId: 999,
        assignedDate: '2025-09-25',
        dueDate: '2025-09-30',
        status: 'pending' as const,
        completedDate: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })
    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      expect(screen.getByText('Unknown Chore')).toBeInTheDocument()
      expect(screen.getByText('Unknown User')).toBeInTheDocument()
      expect(screen.getByText(/0 points/)).toBeInTheDocument()
    })
  })

  it('should display multiple assignments with varied data correctly', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Sweep Floor',
        description: 'All rooms',
        difficulty: 'easy' as const,
        points: 12,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      },
      {
        id: 2,
        title: 'Do Homework',
        description: 'Math and Reading',
        difficulty: 'medium' as const,
        points: 18,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      },
      {
        id: 3,
        title: 'Clean Garage',
        description: 'Full organization',
        difficulty: 'hard' as const,
        points: 60,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    const mockUsers = [
      {
        id: 1,
        name: 'Olivia Taylor',
        email: 'olivia@test.com',
        role: 'child' as const,
        totalPoints: 200,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2010-01-01',
      },
      {
        id: 2,
        name: 'Noah Taylor',
        email: 'noah@test.com',
        role: 'child' as const,
        totalPoints: 175,
        isActive: true,
        familyId: 1,
        createdBy: 1,
        lastLogin: new Date().toISOString(),
        birthdate: '2012-05-15',
      },
    ]

    const mockAssignments = [
      {
        id: 1,
        childId: 1,
        choreId: 1,
        assignedDate: '2025-09-28',
        dueDate: '2025-09-29',
        status: 'completed' as const,
        completedDate: '2025-09-28',
      },
      {
        id: 2,
        childId: 2,
        choreId: 2,
        assignedDate: '2025-09-29',
        dueDate: '2025-09-30',
        status: 'in_progress' as const,
        completedDate: null,
      },
      {
        id: 3,
        childId: 1,
        choreId: 3,
        assignedDate: '2025-09-25',
        dueDate: '2025-10-05',
        status: 'pending' as const,
        completedDate: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })
    mockApi.getUsers.mockResolvedValue({ success: true, data: mockUsers })
    mockApi.getAssignments.mockResolvedValue({
      success: true,
      data: mockAssignments,
    })

    renderWithRouter(<AssignmentsPage />)

    await waitFor(() => {
      const assignmentRows = screen.getAllByTestId('assignment-row')
      expect(assignmentRows).toHaveLength(3)

      expect(screen.getAllByText('Sweep Floor').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Do Homework').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Clean Garage').length).toBeGreaterThan(0)

      expect(screen.getAllByText('Olivia Taylor').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Noah Taylor').length).toBeGreaterThan(0)

      const pointElements = screen.getAllByText(/\d+ points/)
      expect(
        pointElements.some((el) => el.textContent?.includes('12 points')),
      ).toBe(true)
      expect(
        pointElements.some((el) => el.textContent?.includes('18 points')),
      ).toBe(true)
      expect(
        pointElements.some((el) => el.textContent?.includes('60 points')),
      ).toBe(true)
    })
  })
})
