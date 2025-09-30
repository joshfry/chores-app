import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Modal from '../../components/Modal'
import type { User } from '../../types/api'

const Form = styled.form``

const FormGroup = styled.div``

const Label = styled.label``

const Input = styled.input``

const ErrorMessage = styled.div``

const ButtonGroup = styled.div``

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>``

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSubmit: (
    userId: number,
    updates: { name: string; birthdate?: string },
  ) => Promise<void>
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        birthdate: user.birthdate || '',
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit(user.id, {
        name: formData.name,
        birthdate: formData.birthdate || undefined,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update user')
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
        form="edit-user-form"
        disabled={isSubmitting || !formData.name}
        data-testid="submit-button"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </ButtonGroup>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" footer={footer}>
      <Form id="edit-user-form" onSubmit={handleSubmit}>
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

export default EditUserModal
