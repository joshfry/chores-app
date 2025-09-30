import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'

const Container = styled.div``

const Card = styled.div``

const Spinner = styled.div``

const Icon = styled.div<{ type: 'success' | 'error' }>``

const Title = styled.h1``

const Message = styled.p``

const Button = styled.button``

const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying',
  )
  const [errorMessage, setErrorMessage] = useState('')
  const { state, verifyMagicToken } = useAuth()
  const hasAttemptedVerification = useRef(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (hasAttemptedVerification.current) {
      return
    }

    const verify = async () => {
      if (!token) {
        setStatus('error')
        setErrorMessage('No verification token found in the URL.')
        return
      }

      console.log('🔍 Starting verification with token:', token)

      try {
        hasAttemptedVerification.current = true
        const success = await verifyMagicToken(token)
        console.log('✅ Verification result:', success)
        console.log('🔐 Auth state after verification:', state)

        if (success) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMessage(
            'Verification failed. Please request a new magic link.',
          )
        }
      } catch (error: any) {
        setStatus('error')
        setErrorMessage(
          error?.message || 'Verification failed. Please try again.',
        )
      }
    }

    verify()
  }, [token, verifyMagicToken, state.isAuthenticated])

  useEffect(() => {
    console.log(
      '🚀 Redirect effect triggered - status:',
      status,
      'isAuthenticated:',
      state.isAuthenticated,
    )
    if (status === 'success' && state.isAuthenticated) {
      console.log('🎯 Setting up redirect timer')
      const timer = setTimeout(() => {
        console.log('⏰ Timer fired - redirecting to dashboard')
        window.location.href = '/dashboard'
      }, 2000)

      return () => {
        console.log('🧹 Clearing redirect timer')
        clearTimeout(timer)
      }
    }
  }, [status, state.isAuthenticated])

  if (status === 'success' && state.isAuthenticated) {
    console.log('🏃‍♂️ Immediate redirect via Navigate component')
    return <Navigate to="/dashboard" replace />
  }

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard'
  }

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <Spinner />
            <Title>Verifying Your Account</Title>
            <Message>Please wait while we verify your magic link...</Message>
          </>
        )

      case 'success':
        return (
          <>
            <Icon type="success">✓</Icon>
            <Title>Verification Successful!</Title>
            <Message>
              Your account has been verified. Redirecting you to the
              dashboard...
            </Message>
            <Button onClick={handleGoToDashboard}>Go to Dashboard</Button>
          </>
        )

      case 'error':
        return (
          <>
            <Icon type="error">✕</Icon>
            <Title>Verification Failed</Title>
            <Message>{errorMessage}</Message>
            <Button onClick={() => (window.location.href = '/login')}>
              Back to Login
            </Button>
          </>
        )

      default:
        return null
    }
  }

  return (
    <Container>
      <Card>{renderContent()}</Card>
    </Container>
  )
}

export default VerifyPage
