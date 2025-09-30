import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'

const LoadingContainer = styled.div``

const Spinner = styled.div``

const LoadingText = styled.div``

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useAuth()
  const location = useLocation()

  if (state.isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading your dashboard...</LoadingText>
      </LoadingContainer>
    )
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
