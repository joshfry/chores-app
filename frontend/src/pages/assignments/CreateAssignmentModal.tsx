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

const ChoresList = styled.div``

const ChoreCheckbox = styled.label``

const Checkbox = styled.input``

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
    startDate: string
    choreIds: number[]
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
    startDate: getNextSunday(),
    choreIds: [] as number[],
    notes: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function getNextSunday(): string {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const nextSunday = new Date(today)
    nextSunday.setDate(today.getDate() + daysUntilSunday)
    return nextSunday.toISOString().split('T')[0]
  }

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

  const handleChoreToggle = (choreId: number) => {
    setFormData((prev) => ({
      ...prev,
      choreIds: prev.choreIds.includes(choreId)
        ? prev.choreIds.filter((id) => id !== choreId)
        : [...prev.choreIds, choreId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        childId: parseInt(formData.childId),
        startDate: formData.startDate,
        choreIds: formData.choreIds,
        notes: formData.notes || undefined,
      })
      setFormData({
        childId: '',
        startDate: getNextSunday(),
        choreIds: [],
        notes: '',
      })
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
          !formData.startDate ||
          formData.choreIds.length === 0
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
      title="Create Weekly Assignment"
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
          <Label htmlFor="startDate">Start Date (Sunday) *</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
            data-testid="start-date-input"
          />
        </FormGroup>

        <FormGroup>
          <Label>Select Chores *</Label>
          <ChoresList>
            {chores.map((chore) => (
              <ChoreCheckbox key={chore.id} data-testid={`chore-${chore.id}`}>
                <Checkbox
                  type="checkbox"
                  checked={formData.choreIds.includes(chore.id)}
                  onChange={() => handleChoreToggle(chore.id)}
                  data-testid={`checkbox-${chore.id}`}
                />
                <span>
                  {chore.title}
                  {chore.isRecurring &&
                    chore.recurrenceDays &&
                    chore.recurrenceDays.length > 0 && (
                      <span> ({chore.recurrenceDays.join(', ')})</span>
                    )}
                </span>
              </ChoreCheckbox>
            ))}
          </ChoresList>
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
