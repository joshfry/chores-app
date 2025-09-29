import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`

const Sidebar = styled.aside<{ isOpen: boolean }>`
  width: ${(props) => (props.isOpen ? '256px' : '64px')};
  background: white;
  border-right: 1px solid #e5e7eb;
  transition: width 0.3s ease;
  flex-shrink: 0;

  @media (max-width: 768px) {
    position: fixed;
    left: ${(props) => (props.isOpen ? '0' : '-100%')};
    width: 256px;
    height: 100vh;
    z-index: 50;
    box-shadow: ${(props) =>
      props.isOpen ? '0 10px 25px -3px rgba(0, 0, 0, 0.1)' : 'none'};
  }
`

const SidebarHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Logo = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: bold;
  color: #1f2937;

  .icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
  }

  .text {
    ${(props) => (props.collapsed ? 'display: none;' : '')}
  }
`

const ToggleButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;

  &:hover {
    background: #e5e7eb;
  }

  @media (max-width: 768px) {
    display: none;
  }
`

const Nav = styled.nav`
  padding: 1rem 0;
  flex: 1;
`

const NavItem = styled(Link)<{ isActive: boolean; collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 0 0.5rem;
  border-radius: 8px;
  color: ${(props) => (props.isActive ? '#667eea' : '#6b7280')};
  background: ${(props) => (props.isActive ? '#eff6ff' : 'transparent')};
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.isActive ? '#eff6ff' : '#f3f4f6')};
    color: ${(props) => (props.isActive ? '#667eea' : '#374151')};
  }

  .icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .text {
    ${(props) => (props.collapsed ? 'display: none;' : '')}
  }
`

const UserSection = styled.div`
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
`

const UserInfo = styled.div<{ collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  .avatar {
    width: 32px;
    height: 32px;
    background: #667eea;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 500;
  }

  .info {
    ${(props) => (props.collapsed ? 'display: none;' : '')}

    .name {
      font-weight: 500;
      color: #1f2937;
      font-size: 0.875rem;
    }

    .role {
      color: #6b7280;
      font-size: 0.75rem;
      text-transform: capitalize;
    }
  }
`

const LogoutButton = styled.button<{ collapsed: boolean }>`
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  ${(props) =>
    props.collapsed
      ? 'padding: 0.5rem; display: flex; align-items: center; justify-content: center;'
      : ''}

  &:hover {
    background: #fecaca;
  }
`

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const MobileMenuButton = styled.button`
  display: none;
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;

  &:hover {
    background: #e5e7eb;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`

const Content = styled.div`
  flex: 1;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const Overlay = styled.div<{ show: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${(props) => (props.show ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }
`

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { state, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Users', href: '/dashboard/users', icon: '👥' },
    { name: 'Chores', href: '/dashboard/chores', icon: '✅' },
    { name: 'Assignments', href: '/dashboard/assignments', icon: '📋' },
  ]

  const getPageTitle = () => {
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

  return (
    <Container>
      <Overlay show={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />

      <Sidebar isOpen={sidebarOpen || mobileMenuOpen}>
        <SidebarHeader>
          <Logo collapsed={!sidebarOpen && !mobileMenuOpen}>
            <div className="icon">🏠</div>
            <div className="text">Family Chores</div>
          </Logo>
          <ToggleButton onClick={toggleSidebar}>
            {sidebarOpen ? '←' : '→'}
          </ToggleButton>
        </SidebarHeader>

        <Nav>
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              to={item.href}
              isActive={location.pathname === item.href}
              collapsed={!sidebarOpen && !mobileMenuOpen}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="icon">{item.icon}</div>
              <div className="text">{item.name}</div>
            </NavItem>
          ))}
        </Nav>

        <UserSection>
          <UserInfo collapsed={!sidebarOpen && !mobileMenuOpen}>
            <div className="avatar">
              {state.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="info">
              <div className="name">{state.user?.name}</div>
              <div className="role">{state.user?.role}</div>
            </div>
          </UserInfo>
          <LogoutButton
            collapsed={!sidebarOpen && !mobileMenuOpen}
            onClick={handleLogout}
          >
            {!sidebarOpen && !mobileMenuOpen ? '🚪' : 'Sign Out'}
          </LogoutButton>
        </UserSection>
      </Sidebar>

      <Main>
        <Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MobileMenuButton onClick={toggleMobileMenu}>☰</MobileMenuButton>
            <PageTitle>{getPageTitle()}</PageTitle>
          </div>

          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {state.family?.name}
          </div>
        </Header>

        <Content>
          <Outlet />
        </Content>
      </Main>
    </Container>
  )
}

export default DashboardLayout
