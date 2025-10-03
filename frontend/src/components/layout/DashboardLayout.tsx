import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const { state, logout } = useAuth()
  const location = useLocation()

  const isChild = state.user?.role === 'child'

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Users', href: '/users', icon: '👥' },
    { name: 'Chores', href: '/chores', icon: '✅' },
  ]

  const getPageTitle = () => {
    if (isChild) return 'My Assignments'
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path.includes('/users')) return 'Users'
    if (path.includes('/chores')) return 'Chores'
    if (path.includes('/assignments')) return 'Assignments'
    return 'Dashboard'
  }

  const handleLogout = async () => {
    await logout()
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const isCollapsed = !sidebarOpen && !mobileMenuOpen

  // Child users see simplified layout without sidebar
  if (isChild) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Header for child users */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏠</div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Assignments
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  {state.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block">
                  <div
                    className="text-sm font-medium text-gray-900"
                    data-testid="user-name"
                  >
                    {state.user?.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {state.user?.role}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                data-testid="logout-button"
                className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div
          className="flex-1 overflow-auto p-4 lg:p-6"
          data-testid="dashboard"
        >
          <Outlet />
        </div>
      </div>
    )
  }

  // Parent users see full layout with sidebar
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div
            className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}
          >
            <div className="text-2xl">🏠</div>
            {!isCollapsed && (
              <div className="font-semibold text-gray-900">Family Chores</div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className={`hidden lg:block text-gray-500 hover:text-gray-700 ${isCollapsed ? 'absolute top-4 right-4' : ''}`}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`nav-${item.name.toLowerCase()}`}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          <div
            className={`flex items-center gap-3 mb-3 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
              {state.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium text-gray-900 truncate"
                  data-testid="user-name"
                >
                  {state.user?.name}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {state.user?.role}
                </div>
              </div>
            )}
          </div>

          {/* My Account dropdown */}
          {!isCollapsed ? (
            <div className="mb-2">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span>My Account</span>
                <span className="text-xs">{accountMenuOpen ? '▼' : '▶'}</span>
              </button>
              {accountMenuOpen && (
                <div className="mt-1 ml-2 border-l-2 border-gray-200 pl-2">
                  <Link
                    to="/assignments"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                      ${
                        location.pathname === '/assignments'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    data-testid="nav-assignments"
                  >
                    <span className="text-base">📋</span>
                    <span>Assignments</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/assignments"
              className={`
                flex items-center justify-center w-full px-3 py-2 mb-2 text-xl rounded-lg transition-colors
                ${
                  location.pathname === '/assignments'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              data-testid="nav-assignments"
              title="Assignments"
            >
              📋
            </Link>
          )}

          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className={`
              w-full px-3 py-2 text-sm font-medium text-red-600 
              hover:bg-red-50 rounded-lg transition-colors
              ${isCollapsed ? 'text-center' : 'text-left'}
            `}
          >
            {isCollapsed ? '🚪' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMobileMenu}
                data-testid="mobile-nav-toggle"
                className="lg:hidden text-gray-500 hover:text-gray-700 text-2xl"
              >
                ☰
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
            <div className="text-sm text-gray-600" data-testid="family-name">
              {state.family?.name}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div
          className="flex-1 overflow-auto p-4 lg:p-6"
          data-testid="dashboard"
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
