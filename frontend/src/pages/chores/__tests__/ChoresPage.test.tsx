import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ChoresPage from '../ChoresPage'
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

describe('ChoresPage - Real Data Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display real chore titles from API, not hard-coded values', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Clean the Kitchen',
        description: 'Wipe counters and sweep floor',
        difficulty: 'medium' as const,
        points: 20,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      },
      {
        id: 2,
        title: 'Water the Plants',
        description: 'Water all indoor plants',
        difficulty: 'easy' as const,
        points: 5,
        isRecurring: true,
        recurrencePattern: 'weekly' as const,
      },
      {
        id: 3,
        title: 'Organize Garage',
        description: 'Sort and organize garage items',
        difficulty: 'hard' as const,
        points: 50,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      expect(screen.getByText('Clean the Kitchen')).toBeInTheDocument()
      expect(screen.getByText('Water the Plants')).toBeInTheDocument()
      expect(screen.getByText('Organize Garage')).toBeInTheDocument()
    })

    // Verify NOT using hard-coded generic names
    expect(screen.queryByText('Chore 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Sample Chore')).not.toBeInTheDocument()
    expect(screen.queryByText('Task Name')).not.toBeInTheDocument()
  })

  it('should display real chore descriptions from API', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Do Laundry',
        description: 'Wash, dry, and fold all family laundry',
        difficulty: 'medium' as const,
        points: 25,
        isRecurring: true,
        recurrencePattern: 'weekly' as const,
      },
      {
        id: 2,
        title: 'Vacuum House',
        description: 'Vacuum all rooms including under furniture',
        difficulty: 'medium' as const,
        points: 30,
        isRecurring: true,
        recurrencePattern: 'weekly' as const,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      expect(
        screen.getByText('Wash, dry, and fold all family laundry'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Vacuum all rooms including under furniture'),
      ).toBeInTheDocument()
    })
  })

  it('should display real points values from API, not hard-coded values', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Quick Task',
        description: 'Simple task',
        difficulty: 'easy' as const,
        points: 5,
        isRecurring: false,
        recurrencePattern: null,
      },
      {
        id: 2,
        title: 'Medium Task',
        description: 'Average difficulty',
        difficulty: 'medium' as const,
        points: 25,
        isRecurring: false,
        recurrencePattern: null,
      },
      {
        id: 3,
        title: 'Hard Task',
        description: 'Complex task',
        difficulty: 'hard' as const,
        points: 75,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      const pointElements = screen.getAllByText(/\d+ points/)
      expect(
        pointElements.some((el) => el.textContent?.includes('5 points')),
      ).toBe(true)
      expect(
        pointElements.some((el) => el.textContent?.includes('25 points')),
      ).toBe(true)
      expect(
        pointElements.some((el) => el.textContent?.includes('75 points')),
      ).toBe(true)
    })

    // Verify NOT all the same value
    const allSamePoints =
      screen.queryAllByText('10 points').length === mockChores.length
    expect(allSamePoints).toBe(false)
  })

  it('should display real difficulty levels from API', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Easy Chore',
        description: 'Simple',
        difficulty: 'easy' as const,
        points: 5,
        isRecurring: false,
        recurrencePattern: null,
      },
      {
        id: 2,
        title: 'Medium Chore',
        description: 'Moderate',
        difficulty: 'medium' as const,
        points: 15,
        isRecurring: false,
        recurrencePattern: null,
      },
      {
        id: 3,
        title: 'Hard Chore',
        description: 'Complex',
        difficulty: 'hard' as const,
        points: 30,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      const difficultyBadges = screen.getAllByText(/^(easy|medium|hard)$/)
      expect(difficultyBadges).toHaveLength(3)
      expect(difficultyBadges[0]).toHaveTextContent('easy')
      expect(difficultyBadges[1]).toHaveTextContent('medium')
      expect(difficultyBadges[2]).toHaveTextContent('hard')
    })
  })

  it('should display real recurring status from API', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Daily Task',
        description: 'Repeats daily',
        difficulty: 'easy' as const,
        points: 10,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      },
      {
        id: 2,
        title: 'One-time Task',
        description: 'Do once',
        difficulty: 'medium' as const,
        points: 20,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      expect(screen.getByText('Recurring')).toBeInTheDocument()
      expect(screen.getByText('One-time')).toBeInTheDocument()
    })
  })

  it('should display real recurrence patterns from API', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Daily Chore',
        description: 'Every day',
        difficulty: 'easy' as const,
        points: 5,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      },
      {
        id: 2,
        title: 'Weekly Chore',
        description: 'Every week',
        difficulty: 'medium' as const,
        points: 15,
        isRecurring: true,
        recurrencePattern: 'weekly' as const,
      },
      {
        id: 3,
        title: 'Monthly Chore',
        description: 'Every month',
        difficulty: 'hard' as const,
        points: 40,
        isRecurring: true,
        recurrencePattern: 'monthly' as const,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      expect(screen.getByText('Repeats: daily')).toBeInTheDocument()
      expect(screen.getByText('Repeats: weekly')).toBeInTheDocument()
      expect(screen.getByText('Repeats: monthly')).toBeInTheDocument()
    })
  })

  it('should show empty state when no chores exist (no fake data)', async () => {
    mockApi.getChores.mockResolvedValue({ success: true, data: [] })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      expect(screen.getByText('No chores created yet')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Create your first chore to start managing family tasks.',
        ),
      ).toBeInTheDocument()
    })

    // Verify no chore cards are shown
    expect(screen.queryByTestId('chore-card')).not.toBeInTheDocument()
  })

  it('should handle API errors without showing fake data', async () => {
    mockApi.getChores.mockResolvedValue({
      success: false,
      error: 'Server error',
    })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    // Verify no chore data is shown
    expect(screen.queryByTestId('chore-card')).not.toBeInTheDocument()
  })

  it('should display loading state without showing fake data', async () => {
    mockApi.getChores.mockImplementation(() => new Promise(() => {})) // Never resolves

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      expect(screen.getByText('Loading chores...')).toBeInTheDocument()
    })

    // Verify no chores are shown while loading
    expect(screen.queryByTestId('chore-card')).not.toBeInTheDocument()
  })

  it('should verify no hard-coded chore data in cards', async () => {
    const uniqueChores = [
      {
        id: 999,
        title: 'Unique Chore Alpha',
        description: 'Very specific description alpha',
        difficulty: 'easy' as const,
        points: 123,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      },
      {
        id: 1000,
        title: 'Unique Chore Beta',
        description: 'Very specific description beta',
        difficulty: 'hard' as const,
        points: 456,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: uniqueChores })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      expect(screen.getByText('Unique Chore Alpha')).toBeInTheDocument()
      expect(screen.getByText('Unique Chore Beta')).toBeInTheDocument()
      expect(
        screen.getByText('Very specific description alpha'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Very specific description beta'),
      ).toBeInTheDocument()

      const pointElements = screen.getAllByText(/\d+ points/)
      expect(
        pointElements.some((el) => el.textContent?.includes('123 points')),
      ).toBe(true)
      expect(
        pointElements.some((el) => el.textContent?.includes('456 points')),
      ).toBe(true)
    })

    // Common hard-coded values that should NOT appear
    expect(screen.queryByText('Sample Chore')).not.toBeInTheDocument()
    expect(screen.queryByText('Do the dishes')).not.toBeInTheDocument()
    expect(screen.queryByText('Clean room')).not.toBeInTheDocument()
    expect(screen.queryByText('Default chore')).not.toBeInTheDocument()
  })

  it('should display multiple chores with different data correctly', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Feed the Dog',
        description: 'Morning and evening',
        difficulty: 'easy' as const,
        points: 8,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      },
      {
        id: 2,
        title: 'Mow the Lawn',
        description: 'Front and back yard',
        difficulty: 'hard' as const,
        points: 45,
        isRecurring: true,
        recurrencePattern: 'weekly' as const,
      },
      {
        id: 3,
        title: 'Wash Car',
        description: 'Exterior only',
        difficulty: 'medium' as const,
        points: 22,
        isRecurring: false,
        recurrencePattern: null,
      },
      {
        id: 4,
        title: 'Clean Bathroom',
        description: 'Sink, toilet, shower',
        difficulty: 'medium' as const,
        points: 28,
        isRecurring: true,
        recurrencePattern: 'weekly' as const,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      const choreCards = screen.getAllByTestId('chore-card')
      expect(choreCards).toHaveLength(4)
    })

    // Verify all unique data is present
    expect(screen.getByText('Feed the Dog')).toBeInTheDocument()
    expect(screen.getByText('Mow the Lawn')).toBeInTheDocument()
    expect(screen.getByText('Wash Car')).toBeInTheDocument()
    expect(screen.getByText('Clean Bathroom')).toBeInTheDocument()

    expect(screen.getByText('Morning and evening')).toBeInTheDocument()
    expect(screen.getByText('Front and back yard')).toBeInTheDocument()
    expect(screen.getByText('Exterior only')).toBeInTheDocument()
    expect(screen.getByText('Sink, toilet, shower')).toBeInTheDocument()
  })

  it('should handle chores with null/empty descriptions gracefully', async () => {
    const mockChores = [
      {
        id: 1,
        title: 'Chore with Description',
        description: 'Has a description',
        difficulty: 'easy' as const,
        points: 10,
        isRecurring: false,
        recurrencePattern: null,
      },
      {
        id: 2,
        title: 'Chore without Description',
        description: null,
        difficulty: 'easy' as const,
        points: 10,
        isRecurring: false,
        recurrencePattern: null,
      },
    ]

    mockApi.getChores.mockResolvedValue({ success: true, data: mockChores })

    renderWithRouter(<ChoresPage />)

    await waitFor(() => {
      expect(screen.getByText('Chore with Description')).toBeInTheDocument()
      expect(screen.getByText('Chore without Description')).toBeInTheDocument()
      expect(screen.getByText('Has a description')).toBeInTheDocument()
    })

    // Should not show placeholder text for null description
    const choreCards = screen.getAllByTestId('chore-card')
    expect(choreCards).toHaveLength(2)
  })
})
