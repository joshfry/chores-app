import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'

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
`

const Title = styled.h1`
  text-align: center;
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  text-align: center;
  color: #6b7280;
  margin-bottom: 2rem;
`

const Form = styled.form`
  space-y: 1rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const Button = styled.button<{
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}>`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  ${(props) =>
    props.variant === 'secondary'
      ? `
    background: white;
    border: 1px solid #d1d5db;
    color: #374151;
    
    &:hover:not(:disabled) {
      background: #f9fafb;
    }
  `
      : `
    background: ${props.disabled ? '#9ca3af' : '#667eea'};
    border: 1px solid ${props.disabled ? '#9ca3af' : '#667eea'};
    color: white;
    
    &:hover:not(:disabled) {
      background: #5a67d8;
      border-color: #5a67d8;
    }
  `}

  &:disabled {
    opacity: 0.6;
  }
`

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.75rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 0.75rem;
  color: #166534;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
`

const StyledLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`

const FormGroup = styled.div`
  margin-bottom: 1rem;
`

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { state, login, clearError } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setShowSuccess(false)
    clearError()

    const success = await login(email)

    if (success) {
      setShowSuccess(true)
      setEmail('')
    }

    setIsSubmitting(false)
  }

  const isValidEmail = email.includes('@') && email.includes('.')

  return (
    <Container>
      <Card>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to your family chores account</Subtitle>

        {state.error && <ErrorMessage>{state.error}</ErrorMessage>}

        {showSuccess && (
          <SuccessMessage>
            📧 Magic link sent! Check your email and click the link to sign in.
          </SuccessMessage>
        )}

        <Form onSubmit={handleSubmit} data-testid="login-form">
          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              required
              data-testid="login-email"
            />
          </FormGroup>

          <FormGroup>
            <Button
              type="submit"
              disabled={isSubmitting || !isValidEmail}
              data-testid="login-submit"
            >
              {isSubmitting ? 'Sending Magic Link...' : 'Send Magic Link'}
            </Button>
          </FormGroup>
        </Form>

        <LinkText>
          Don't have an account?{' '}
          <StyledLink to="/signup">Create a family account</StyledLink>
        </LinkText>
      </Card>
    </Container>
  )
}

export default LoginPage
