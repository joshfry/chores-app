// API Types matching backend
export interface User {
  id: number
  email: string
  name: string
  role: 'parent' | 'child'
  familyId: number
  birthdate: string
  createdBy: number | null
  lastLogin: Date | string
  isActive: boolean
}

export interface Family {
  id: number
  name: string
  createdDate: Date | string
  primaryParentId: number
}

export interface Chore {
  id: number
  title: string
  description: string
  isRecurring: boolean
  recurrenceDays?: string[] // e.g., ["monday", "wednesday", "friday"]
  familyId: number
  category?: string
}

export interface Assignment {
  id: number
  childId: number
  startDate: string // Always Sunday
  endDate?: string // Always Saturday
  status: 'assigned' | 'in_progress' | 'completed' | 'missed'
  notes?: string
  chores?: AssignmentChore[]
  childName?: string
}

export interface AssignmentChore {
  id: number
  assignmentId: number
  choreId: number
  status: 'pending' | 'completed' | 'skipped'
  completedOn?: string | null // Day of week (null for non-recurring chores)
  chore?: Chore
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    sessionToken?: string
    user: User
    family: Family | null
  }
  error?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface LoginRequest {
  email: string
}

export interface SignupRequest {
  email: string
  name: string
  familyName: string
  birthdate?: string
}

export interface CreateChildRequest {
  email: string
  name: string
  birthdate: string
}

export interface UpdateUserRequest {
  name?: string
  birthdate?: string
}

export interface DashboardStats {
  totalChildren: number
  totalChores: number
  totalAssignments: number
  completedAssignments: number
  pendingAssignments: number
  thisWeek: {
    assignmentsCompleted: number
  }
  topPerformers: Array<{
    childId: number
    childName: string
    choresCompleted: number
  }>
}
