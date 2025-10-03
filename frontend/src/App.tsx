import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Auth Components
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import VerifyPage from './pages/auth/VerifyPage'

// Dashboard Components
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'

// Placeholder pages (we'll create these next)
import UsersPage from './pages/users/UsersPage'
import ChoresPage from './pages/chores/ChoresPage'
import AssignmentsPage from './pages/assignments/AssignmentsPage'
import MyAccountPage from './pages/account/MyAccountPage'

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute'

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { state } = useAuth()

  // Redirect based on user role
  if (state.user?.role === 'child') {
    return <Navigate to="/assignments" replace />
  }
  return <Navigate to="/dashboard" replace />
}

// Parent-only route wrapper
const ParentOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state } = useAuth()

  if (state.user?.role === 'child') {
    return <Navigate to="/assignments" replace />
  }

  return <>{children}</>
}

function App() {
  const tree = (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify" element={<VerifyPage />} />

          {/* Protected Routes - Parent Only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ParentOnlyRoute>
                  <DashboardLayout />
                </ParentOnlyRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
          </Route>

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <ParentOnlyRoute>
                  <DashboardLayout />
                </ParentOnlyRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<UsersPage />} />
          </Route>

          <Route
            path="/chores"
            element={
              <ProtectedRoute>
                <ParentOnlyRoute>
                  <DashboardLayout />
                </ParentOnlyRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<ChoresPage />} />
          </Route>

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <ParentOnlyRoute>
                  <DashboardLayout />
                </ParentOnlyRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<MyAccountPage />} />
          </Route>

          {/* Protected Routes - All Users */}
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AssignmentsPage />} />
          </Route>

          {/* Redirect root based on role */}
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Catch all route */}
          <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  )

  if (process.env.NODE_ENV === 'test') {
    return tree
  }

  return <React.StrictMode>{tree}</React.StrictMode>
}

export default App
