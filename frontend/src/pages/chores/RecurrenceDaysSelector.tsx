import React from 'react'
import styled from 'styled-components'

const Container = styled.div``

const DaysGrid = styled.div``

const DayCheckbox = styled.label``

const Checkbox = styled.input``

const DayLabel = styled.span``

interface RecurrenceDaysSelectorProps {
  selectedDays: string[]
  onChange: (days: string[]) => void
  disabled?: boolean
}

const DAYS_OF_WEEK = [
  { value: 'everyday', label: 'Everyday' },
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
]

const RecurrenceDaysSelector: React.FC<RecurrenceDaysSelectorProps> = ({
  selectedDays,
  onChange,
  disabled = false,
}) => {
  const handleDayToggle = (day: string) => {
    if (day === 'everyday') {
      // If "Everyday" is selected, toggle it and clear other days
      if (selectedDays.includes('everyday')) {
        onChange([])
      } else {
        onChange(['everyday'])
      }
    } else {
      // If any other day is selected, remove "Everyday" and toggle the day
      const newDays = selectedDays.filter((d) => d !== 'everyday')
      if (newDays.includes(day)) {
        onChange(newDays.filter((d) => d !== day))
      } else {
        onChange([...newDays, day])
      }
    }
  }

  return (
    <Container>
      <DaysGrid>
        {DAYS_OF_WEEK.map((day) => (
          <DayCheckbox key={day.value} data-testid={`day-${day.value}`}>
            <Checkbox
              type="checkbox"
              checked={selectedDays.includes(day.value)}
              onChange={() => handleDayToggle(day.value)}
              disabled={disabled}
              data-testid={`checkbox-${day.value}`}
            />
            <DayLabel>{day.label}</DayLabel>
          </DayCheckbox>
        ))}
      </DaysGrid>
    </Container>
  )
}

export default RecurrenceDaysSelector
