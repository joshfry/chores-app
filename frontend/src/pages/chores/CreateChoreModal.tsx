import React, { useState } from 'react'
import styled from 'styled-components'
import Modal from '../../components/Modal'

const Form = styled.form``

const FormGroup = styled.div``

const Label = styled.label``

const Input = styled.input``

const Textarea = styled.textarea``

const Select = styled.select``

const Checkbox = styled.input``

const CheckboxLabel = styled.label``

const ErrorMessage = styled.div``

const ButtonGroup = styled.div``

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>``

interface CreateChoreModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (choreData: {
    title: string
    description?: string
    points: number
    difficulty: 'easy' | 'medium' | 'hard'
    isRecurring: boolean
    recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'custom'
  }) => Promise<void>
}

const CreateChoreModal: React.FC<CreateChoreModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 10,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    isRecurring: false,
    recurrencePattern: '' as '' | 'daily' | 'weekly' | 'monthly' | 'custom',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        title: formData.title,
        description: formData.description || undefined,
        points: formData.points,
        difficulty: formData.difficulty,
        isRecurring: formData.isRecurring,
        recurrencePattern:
          formData.isRecurring && formData.recurrencePattern
            ? formData.recurrencePattern
            : undefined,
      })
      setFormData({
        title: '',
        description: '',
        points: 10,
        difficulty: 'easy',
        isRecurring: false,
        recurrencePattern: '',
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create chore')
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
        form="create-chore-form"
        disabled={isSubmitting || !formData.title}
        data-testid="submit-button"
      >
        {isSubmitting ? 'Creating...' : 'Create Chore'}
      </Button>
    </ButtonGroup>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Chore"
      footer={footer}
    >
      <Form id="create-chore-form" onSubmit={handleSubmit}>
        {error && (
          <ErrorMessage data-testid="error-message">{error}</ErrorMessage>
        )}

        <FormGroup>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            data-testid="title-input"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            data-testid="description-input"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="points">Points *</Label>
          <Input
            id="points"
            name="points"
            type="number"
            min="1"
            value={formData.points}
            onChange={handleChange}
            required
            data-testid="points-input"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="difficulty">Difficulty *</Label>
          <Select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            data-testid="difficulty-select"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              data-testid="recurring-checkbox"
            />
            Recurring Chore
          </CheckboxLabel>
        </FormGroup>

        {formData.isRecurring && (
          <FormGroup>
            <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
            <Select
              id="recurrencePattern"
              name="recurrencePattern"
              value={formData.recurrencePattern}
              onChange={handleChange}
              data-testid="recurrence-select"
            >
              <option value="">Select pattern</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </FormGroup>
        )}
      </Form>
    </Modal>
  )
}

export default CreateChoreModal
