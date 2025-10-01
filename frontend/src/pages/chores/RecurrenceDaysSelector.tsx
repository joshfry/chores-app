import React from 'react'

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
    <div>
      <div className="grid grid-cols-4 gap-2">
        {DAYS_OF_WEEK.map((day) => (
          <label
            key={day.value}
            data-testid={`day-${day.value}`}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors
              ${
                selectedDays.includes(day.value)
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              type="checkbox"
              checked={selectedDays.includes(day.value)}
              onChange={() => handleDayToggle(day.value)}
              disabled={disabled}
              data-testid={`checkbox-${day.value}`}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium">{day.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default RecurrenceDaysSelector
