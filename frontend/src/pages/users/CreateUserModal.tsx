import React, { useState } from 'react'
import styled from 'styled-components'
import Modal from '../../components/Modal'

const Form = styled.form``

const FormGroup = styled.div``

const Label = styled.label``

const Input = styled.input``

const Select = styled.select``

const ErrorMessage = styled.div``

const ButtonGroup = styled.div``

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>``

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: {
    name: string
    email: string
    role: 'parent' | 'child'
    birthdate?: string
  }) => Promise<void>
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'child' as 'parent' | 'child',
    birthdate: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        birthdate: formData.birthdate || undefined,
      })
      setFormData({ name: '', email: '', role: 'child', birthdate: '' })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const footer = (
    <ButtonGroup>
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        data-testid="cancel-button"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="create-user-form"
        disabled={isSubmitting || !formData.name || !formData.email}
        data-testid="submit-button"
      >
        {isSubmitting ? 'Creating...' : 'Create User'}
      </Button>
    </ButtonGroup>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create User"
      footer={footer}
    >
      <Form id="create-user-form" onSubmit={handleSubmit}>
        {error && (
          <ErrorMessage data-testid="error-message">{error}</ErrorMessage>
        )}

        <FormGroup>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            data-testid="name-input"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            data-testid="email-input"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="role">Role *</Label>
          <Select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            data-testid="role-select"
          >
            <option value="child">Child</option>
            <option value="parent">Parent</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="birthdate">Birthdate</Label>
          <Input
            id="birthdate"
            name="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={handleChange}
            data-testid="birthdate-input"
          />
        </FormGroup>
      </Form>
    </Modal>
  )
}

export default CreateUserModal
