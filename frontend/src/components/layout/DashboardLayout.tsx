import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'

const Container = styled.div``

const Sidebar = styled.aside<{ $isOpen: boolean }>``

const SidebarHeader = styled.div``

const Logo = styled.div<{ $collapsed: boolean }>``

const ToggleButton = styled.button``

const Nav = styled.nav``

const NavItem = styled(Link)<{ $isActive: boolean; $collapsed: boolean }>``

const UserSection = styled.div``

const UserInfo = styled.div<{ $collapsed: boolean }>``

const LogoutButton = styled.button<{ $collapsed: boolean }>``

const Main = styled.main``

const Header = styled.header``

const MobileMenuButton = styled.button``

const PageTitle = styled.h1``

const Content = styled.div``

const Overlay = styled.div<{ $show: boolean }>``

const HeaderGroup = styled.div``

const FamilyName = styled.div``

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { state, logout } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Users', href: '/users', icon: '👥' },
    { name: 'Chores', href: '/chores', icon: '✅' },
    { name: 'Assignments', href: '/assignments', icon: '📋' },
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
      <Overlay
        $show={mobileMenuOpen}
        onClick={() => setMobileMenuOpen(false)}
      />

      <Sidebar $isOpen={sidebarOpen || mobileMenuOpen}>
        <SidebarHeader>
          <Logo $collapsed={!sidebarOpen && !mobileMenuOpen}>
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
              $isActive={location.pathname === item.href}
              $collapsed={!sidebarOpen && !mobileMenuOpen}
              onClick={() => setMobileMenuOpen(false)}
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              <div className="icon">{item.icon}</div>
              <div className="text">{item.name}</div>
            </NavItem>
          ))}
        </Nav>

        <UserSection>
          <UserInfo $collapsed={!sidebarOpen && !mobileMenuOpen}>
            <div className="avatar">
              {state.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="info">
              <div className="name" data-testid="user-name">
                {state.user?.name}
              </div>
              <div className="role">{state.user?.role}</div>
            </div>
          </UserInfo>
          <LogoutButton
            $collapsed={!sidebarOpen && !mobileMenuOpen}
            onClick={handleLogout}
            data-testid="logout-button"
          >
            {!sidebarOpen && !mobileMenuOpen ? '🚪' : 'Sign Out'}
          </LogoutButton>
        </UserSection>
      </Sidebar>

      <Main>
        <Header>
          <HeaderGroup>
            <MobileMenuButton
              onClick={toggleMobileMenu}
              data-testid="mobile-nav-toggle"
            >
              ☰
            </MobileMenuButton>
            <PageTitle>{getPageTitle()}</PageTitle>
          </HeaderGroup>

          <FamilyName data-testid="family-name">
            {state.family?.name}
          </FamilyName>
        </Header>

        <Content data-testid="dashboard">
          <Outlet />
        </Content>
      </Main>
    </Container>
  )
}

export default DashboardLayout
