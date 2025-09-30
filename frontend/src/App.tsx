import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

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

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const tree = (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify" element={<VerifyPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="chores" element={<ChoresPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
