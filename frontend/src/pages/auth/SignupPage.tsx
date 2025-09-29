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
  max-width: 450px;
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    familyName: '',
    birthdate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { state, signup, clearError } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setShowSuccess(false)
    clearError()

    const success = await signup(
      formData.email,
      formData.name,
      formData.familyName,
      formData.birthdate || undefined,
    )

    if (success) {
      setShowSuccess(true)
      setFormData({
        email: '',
        name: '',
        familyName: '',
        birthdate: '',
      })
    }

    setIsSubmitting(false)
  }

  const isValid =
    formData.email.includes('@') &&
    formData.email.includes('.') &&
    formData.name.trim() &&
    formData.familyName.trim()

  return (
    <Container>
      <Card>
        <Title>Create Family Account</Title>
        <Subtitle>Start managing your family's chores together</Subtitle>

        {state.error && <ErrorMessage>{state.error}</ErrorMessage>}

        {showSuccess && (
          <SuccessMessage>
            🎉 Family account created! Check your email for a magic link to get
            started.
          </SuccessMessage>
        )}

        <Form onSubmit={handleSubmit} data-testid="signup-form">
          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="parent@example.com"
              required
              data-testid="signup-email"
            />
          </FormGroup>

          <Row>
            <FormGroup>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Sarah Johnson"
                required
                data-testid="signup-name"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                name="familyName"
                type="text"
                value={formData.familyName}
                onChange={handleChange}
                placeholder="Johnson Family"
                required
                data-testid="signup-family-name"
              />
            </FormGroup>
          </Row>

          <FormGroup>
            <Label htmlFor="birthdate">Birthdate (Optional)</Label>
            <Input
              id="birthdate"
              name="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              data-testid="signup-submit"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Family Account'}
            </Button>
          </FormGroup>
        </Form>

        <LinkText>
          Already have an account?{' '}
          <StyledLink to="/login">Sign in instead</StyledLink>
        </LinkText>
      </Card>
    </Container>
  )
}

export default SignupPage
