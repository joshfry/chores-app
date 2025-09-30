import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const Row = styled.div``

const SignupPage: React.FC = () => {
  const navigate = useNavigate()
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
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'signup-success' },
        })
      }, 1200)
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

        {state.error && (
          <ErrorMessage data-testid="signup-error">{state.error}</ErrorMessage>
        )}

        {showSuccess && (
          <SuccessMessage data-testid="signup-success">
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
