import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Modal from '../../components/Modal'
import type { User, Chore, Assignment } from '../../types/api'

const Form = styled.form``

const FormGroup = styled.div``

const Label = styled.label``

const Input = styled.input``

const Select = styled.select``

const Textarea = styled.textarea``

const Table = styled.table``

const Thead = styled.thead``

const Tbody = styled.tbody``

const Tr = styled.tr``

const Th = styled.th``

const Td = styled.td``

const AddChoreSection = styled.div``

const ErrorMessage = styled.div``

const ButtonGroup = styled.div``

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>``

const RemoveButton = styled.button``

interface EditAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: Assignment | null
  children: User[]
  chores: Chore[]
  onSubmit: (
    id: number,
    assignmentData: {
      childId: number
      startDate: string
      choreIds: number[]
      notes?: string
    },
  ) => Promise<void>
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignment,
  children,
  chores,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    childId: '',
    startDate: '',
    choreIds: [] as number[],
    notes: '',
  })
  const [selectedChoreToAdd, setSelectedChoreToAdd] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (assignment) {
      setFormData({
        childId: assignment.childId.toString(),
        startDate: assignment.startDate,
        choreIds: assignment.chores?.map((ac) => ac.choreId) || [],
        notes: assignment.notes || '',
      })
    }
  }, [assignment])

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

  const handleAddChore = () => {
    if (!selectedChoreToAdd) return

    const choreId = parseInt(selectedChoreToAdd)
    if (!formData.choreIds.includes(choreId)) {
      setFormData((prev) => ({
        ...prev,
        choreIds: [...prev.choreIds, choreId],
      }))
      setSelectedChoreToAdd('')
    }
  }

  const handleRemoveChore = (choreId: number) => {
    setFormData((prev) => ({
      ...prev,
      choreIds: prev.choreIds.filter((id) => id !== choreId),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignment) return

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit(assignment.id, {
        childId: parseInt(formData.childId),
        startDate: formData.startDate,
        choreIds: formData.choreIds,
        notes: formData.notes || undefined,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update assignment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getChoreById = (choreId: number) => {
    return chores.find((c) => c.id === choreId)
  }

  const availableChores = chores.filter(
    (chore) => !formData.choreIds.includes(chore.id),
  )

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
        form="edit-assignment-form"
        disabled={
          isSubmitting ||
          !formData.childId ||
          !formData.startDate ||
          formData.choreIds.length === 0
        }
        data-testid="submit-button"
      >
        {isSubmitting ? 'Updating...' : 'Update Assignment'}
      </Button>
    </ButtonGroup>
  )

  if (!assignment) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Weekly Assignment"
      footer={footer}
    >
      <Form id="edit-assignment-form" onSubmit={handleSubmit}>
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
          <Label>Assigned Chores *</Label>
          <Table data-testid="chores-table">
            <Thead>
              <Tr>
                <Th>Chore</Th>
                <Th>Recurrence</Th>
                <Th>Difficulty</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {formData.choreIds.length === 0 ? (
                <Tr>
                  <Td colSpan={4} style={{ textAlign: 'center' }}>
                    No chores assigned. Add chores below.
                  </Td>
                </Tr>
              ) : (
                formData.choreIds.map((choreId) => {
                  const chore = getChoreById(choreId)
                  if (!chore) return null

                  return (
                    <Tr key={choreId} data-testid={`assigned-chore-${choreId}`}>
                      <Td>{chore.title}</Td>
                      <Td>
                        {chore.isRecurring && chore.recurrenceDays
                          ? chore.recurrenceDays.join(', ')
                          : 'One-time'}
                      </Td>
                      <Td>{chore.difficulty}</Td>
                      <Td>
                        <RemoveButton
                          type="button"
                          onClick={() => handleRemoveChore(choreId)}
                          data-testid={`remove-chore-${choreId}`}
                        >
                          Remove
                        </RemoveButton>
                      </Td>
                    </Tr>
                  )
                })
              )}
            </Tbody>
          </Table>
        </FormGroup>

        <FormGroup>
          <AddChoreSection>
            <Label htmlFor="addChore">Add Chore</Label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Select
                id="addChore"
                value={selectedChoreToAdd}
                onChange={(e) => setSelectedChoreToAdd(e.target.value)}
                data-testid="add-chore-select"
                style={{ flex: 1 }}
              >
                <option value="">Select a chore to add</option>
                {availableChores.map((chore) => (
                  <option key={chore.id} value={chore.id}>
                    {chore.title}
                    {chore.recurrenceDays && chore.recurrenceDays.length > 0
                      ? ` (${chore.recurrenceDays.join(', ')})`
                      : ''}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                onClick={handleAddChore}
                disabled={!selectedChoreToAdd}
                data-testid="add-chore-button"
              >
                Add
              </Button>
            </div>
          </AddChoreSection>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="notes">Notes (Optional)</Label>
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

export default EditAssignmentModal
