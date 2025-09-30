import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'

const Container = styled.div``

const Card = styled.div``

const Title = styled.h1``

const Subtitle = styled.p``

const Form = styled.form``

const Label = styled.label``

const Input = styled.input``

const Button = styled.button<{
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}>``

const ErrorMessage = styled.div``

const SuccessMessage = styled.div``

const LinkText = styled.p``

const StyledLink = styled(Link)``

const FormGroup = styled.div``

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

        {state.error && (
          <ErrorMessage data-testid="login-error">{state.error}</ErrorMessage>
        )}

        {showSuccess && (
          <SuccessMessage data-testid="login-success">
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
