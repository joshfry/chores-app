import React, { useState } from 'react'
import styled from 'styled-components'
import Modal from '../../components/Modal'
import type { User, Chore } from '../../types/api'

const Form = styled.form``

const FormGroup = styled.div``

const Label = styled.label``

const Input = styled.input``

const Select = styled.select``

const Textarea = styled.textarea``

const ErrorMessage = styled.div``

const ButtonGroup = styled.div``

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>``

interface CreateAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  children: User[]
  chores: Chore[]
  onSubmit: (assignmentData: {
    childId: number
    choreId: number
    dueDate: string
    notes?: string
  }) => Promise<void>
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  children,
  chores,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    childId: '',
    choreId: '',
    dueDate: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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
        childId: parseInt(formData.childId),
        choreId: parseInt(formData.choreId),
        dueDate: formData.dueDate,
        notes: formData.notes || undefined,
      })
      setFormData({ childId: '', choreId: '', dueDate: '', notes: '' })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment')
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
        form="create-assignment-form"
        disabled={
          isSubmitting ||
          !formData.childId ||
          !formData.choreId ||
          !formData.dueDate
        }
        data-testid="submit-button"
      >
        {isSubmitting ? 'Creating...' : 'Create Assignment'}
      </Button>
    </ButtonGroup>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Assignment"
      footer={footer}
    >
      <Form id="create-assignment-form" onSubmit={handleSubmit}>
        {error && (
          <ErrorMessage data-testid="error-message">{error}</ErrorMessage>
        )}

        <FormGroup>
          <Label htmlFor="childId">Assign To *</Label>
          <Select
            id="childId"
            name="childId"
            value={formData.childId}
            onChange={handleChange}
            required
            data-testid="child-select"
          >
            <option value="">Select a child</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="choreId">Chore *</Label>
          <Select
            id="choreId"
            name="choreId"
            value={formData.choreId}
            onChange={handleChange}
            required
            data-testid="chore-select"
          >
            <option value="">Select a chore</option>
            {chores.map((chore) => (
              <option key={chore.id} value={chore.id}>
                {chore.title}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            required
            data-testid="due-date-input"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            data-testid="notes-input"
          />
        </FormGroup>
      </Form>
    </Modal>
  )
}

export default CreateAssignmentModal
