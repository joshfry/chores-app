import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
`

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
`

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto 1rem;
`

const Icon = styled.div<{ type: 'success' | 'error' }>`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;

  ${(props) =>
    props.type === 'success'
      ? `
    background: #dcfce7;
    color: #16a34a;
  `
      : `
    background: #fee2e2;
    color: #dc2626;
  `}
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
`

const Message = styled.p`
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`

const Button = styled.button`
  background: #667eea;
  border: 1px solid #667eea;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #5a67d8;
    border-color: #5a67d8;
  }
`

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
          console.log('🎉 Setting status to success')
        } else {
          setStatus('error')
          setErrorMessage(
            state.error ||
              'Verification failed. The link may be expired or invalid.',
          )
          console.log('❌ Verification failed:', state.error)
        }
      } catch (error) {
        console.error('💥 Verification error:', error)
        setStatus('error')
        setErrorMessage('An unexpected error occurred during verification.')
      }
    }

    verify()
  }, [token, verifyMagicToken])

  // Auto-redirect after successful verification with delay for user feedback
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
      }, 2000) // 2 second delay to show success message

      return () => {
        console.log('🧹 Clearing redirect timer')
        clearTimeout(timer)
      }
    }
  }, [status, state.isAuthenticated])

  // Redirect to dashboard if verification succeeded and user is authenticated
  if (status === 'success' && state.isAuthenticated) {
    console.log('🏃‍♂️ Immediate redirect via Navigate component')
    return <Navigate to="/dashboard" replace />
  }

  // Show success message with manual redirect if auth state hasn't updated yet
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
