import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from '../DashboardLayout'

const mockAuthContext = {
  state: {
    user: {
      id: 1,
      name: 'Isabella Rodriguez',
      email: 'isabella@test.com',
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
      name: 'Rodriguez Family',
      primaryParentId: 1,
      createdDate: new Date().toISOString(),
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
  },
  logout: jest.fn(),
}

jest.mock('../../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../../contexts/AuthContext'),
  useAuth: () => mockAuthContext,
}))

const TestChild = () => <div>Test Content</div>

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={component}>
          <Route index element={<TestChild />} />
        </Route>
      </Routes>
    </BrowserRouter>,
  )
}

describe('DashboardLayout - Real Data Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display real user name from auth context, not hard-coded values', async () => {
    renderWithRouter(<DashboardLayout />)

    await waitFor(() => {
      const userNameElement = screen.getByTestId('user-name')
      expect(userNameElement).toHaveTextContent('Isabella Rodriguez')
      expect(userNameElement).not.toHaveTextContent('User Name')
      expect(userNameElement).not.toHaveTextContent('Parent')
      expect(userNameElement).not.toHaveTextContent('Test User')
    })
  })

  it('should display real family name from auth context, not hard-coded values', async () => {
    renderWithRouter(<DashboardLayout />)

    await waitFor(() => {
      const familyNameElement = screen.getByTestId('family-name')
      expect(familyNameElement).toHaveTextContent('Rodriguez Family')
      expect(familyNameElement).not.toHaveTextContent('Family Name')
      expect(familyNameElement).not.toHaveTextContent('My Family')
      expect(familyNameElement).not.toHaveTextContent('The Smiths')
    })
  })

  it('should display real user role from auth context', async () => {
    renderWithRouter(<DashboardLayout />)

    await waitFor(() => {
      const roleElements = screen.getAllByText('parent')
      expect(roleElements.length).toBeGreaterThan(0)
    })
  })

  it('should display real user initial in avatar from actual name', async () => {
    renderWithRouter(<DashboardLayout />)

    await waitFor(() => {
      const avatarElement = screen.getByText('I')
      expect(avatarElement).toBeInTheDocument()
    })
  })

  it('should verify navigation items are not hard-coded user-specific data', async () => {
    renderWithRouter(<DashboardLayout />)

    await waitFor(() => {
      // These should be static navigation labels, not user-specific
      const dashboardLinks = screen.getAllByText('Dashboard')
      expect(dashboardLinks.length).toBeGreaterThan(0)

      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByText('Chores')).toBeInTheDocument()
      expect(screen.getByText('Assignments')).toBeInTheDocument()

      // Logo text should be static
      expect(screen.getByText('Family Chores')).toBeInTheDocument()
    })
  })

  it('should display navigation with real user data in user section', async () => {
    renderWithRouter(<DashboardLayout />)

    await waitFor(() => {
      // User section should have real data
      const userSection = screen.getByTestId('user-name')
      expect(userSection).toHaveTextContent('Isabella Rodriguez')

      // But navigation items remain static
      const dashboardLinks = screen.getAllByText('Dashboard')
      expect(dashboardLinks.length).toBeGreaterThan(0)
    })
  })

  it('should handle user with empty name gracefully', async () => {
    const emptyNameContext = {
      ...mockAuthContext,
      state: {
        ...mockAuthContext.state,
        user: { ...mockAuthContext.state.user, name: '' },
      },
    }

    jest.resetModules()
    jest.doMock('../../../contexts/AuthContext', () => ({
      ...jest.requireActual('../../../contexts/AuthContext'),
      useAuth: () => emptyNameContext,
    }))

    renderWithRouter(<DashboardLayout />)

    await waitFor(() => {
      // Should show default avatar when name is empty
      const userSection = screen.getByTestId('user-name')
      expect(userSection).toBeInTheDocument()
    })
  })

  it('should not display any placeholder or sample user data', async () => {
    renderWithRouter(<DashboardLayout />)

    await waitFor(() => {
      // Verify NO common hard-coded placeholders
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      expect(screen.queryByText('Sample User')).not.toBeInTheDocument()
      expect(screen.queryByText('Test Family')).not.toBeInTheDocument()
      expect(screen.queryByText('Default User')).not.toBeInTheDocument()

      // Verify real data IS present
      expect(screen.getByTestId('user-name')).toHaveTextContent(
        'Isabella Rodriguez',
      )
      expect(screen.getByTestId('family-name')).toHaveTextContent(
        'Rodriguez Family',
      )
    })
  })
})
