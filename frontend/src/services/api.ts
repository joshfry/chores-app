import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type {
  ApiResponse,
  AuthResponse,
  User,
  Chore,
  Assignment,
  LoginRequest,
  SignupRequest,
  CreateChildRequest,
  UpdateUserRequest,
  DashboardStats,
} from '../types/api'

class ApiClient {
  private client: AxiosInstance
  private sessionToken: string | null = null

  constructor(
    baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:3001',
  ) {
    this.client = axios.create({
      baseURL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getSessionTokenFromStorage()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      },
    )

    // Load session token from localStorage
    this.loadSessionToken()
  }

  private loadSessionToken() {
    this.getSessionTokenFromStorage()
  }

  private saveSessionToken(token: string) {
    this.sessionToken = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionToken', token)
    }
  }

  private clearSessionToken() {
    this.sessionToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionToken')
    }
  }

  public clearSession() {
    this.clearSessionToken()
  }

  private getSessionTokenFromStorage(): string | null {
    if (this.sessionToken) {
      return this.sessionToken
    }

    if (typeof window === 'undefined') {
      return null
    }

    const storedToken = localStorage.getItem('sessionToken')
    if (storedToken) {
      this.sessionToken = storedToken
    }
    return this.sessionToken
  }

  // Authentication endpoints
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post(
      '/api/auth/signup',
      data,
    )
    return response.data
  }

  async sendMagicLink(data: LoginRequest): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.post(
      '/api/auth/send-magic-link',
      data,
    )
    return response.data
  }

  async verifyMagicToken(token: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.get(
      `/api/auth/verify?token=${token}`,
    )
    if (response.data.success && response.data.data?.sessionToken) {
      this.saveSessionToken(response.data.data.sessionToken)
    }
    return response.data
  }

  async getCurrentUser(): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> =
      await this.client.get('/api/auth/me')
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout')
    } catch (error) {
      console.warn('Logout API call failed, clearing token locally')
    } finally {
      this.clearSessionToken()
    }
  }

  // User management
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response: AxiosResponse<ApiResponse<User[]>> =
      await this.client.get('/api/auth/users')
    return response.data
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.client.get(
      `/api/auth/users/${id}`,
    )
    return response.data
  }

  async updateUser(
    id: number,
    data: UpdateUserRequest,
  ): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.client.put(
      `/api/auth/users/${id}`,
      data,
    )
    return response.data
  }

  async createChild(data: CreateChildRequest): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.client.post(
      '/api/auth/create-child',
      data,
    )
    return response.data
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.delete(
      `/api/auth/users/${id}`,
    )
    return response.data
  }

  // Chores (using mock endpoints for now)
  async getChores(): Promise<ApiResponse<Chore[]>> {
    const response: AxiosResponse<ApiResponse<Chore[]>> =
      await this.client.get('/api/chores')
    return response.data
  }

  async createChore(data: Partial<Chore>): Promise<ApiResponse<Chore>> {
    const response: AxiosResponse<ApiResponse<Chore>> = await this.client.post(
      '/api/chores',
      data,
    )
    return response.data
  }

  async updateChore(
    id: number,
    data: Partial<Chore>,
  ): Promise<ApiResponse<Chore>> {
    const response: AxiosResponse<ApiResponse<Chore>> = await this.client.put(
      `/api/chores/${id}`,
      data,
    )
    return response.data
  }

  async deleteChore(id: number): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.delete(
      `/api/chores/${id}`,
    )
    return response.data
  }

  // Assignments (using mock endpoints for now)
  async getAssignments(params?: {
    child_id?: number
    status?: string
  }): Promise<ApiResponse<Assignment[]>> {
    const response: AxiosResponse<ApiResponse<Assignment[]>> =
      await this.client.get('/api/assignments', { params })
    return response.data
  }

  async createAssignment(data: {
    childId: number
    startDate: string
    choreIds: number[]
    notes?: string
  }): Promise<ApiResponse<Assignment>> {
    const response: AxiosResponse<ApiResponse<Assignment>> =
      await this.client.post('/api/assignments', data)
    return response.data
  }

  async updateAssignment(
    id: number,
    data: {
      childId?: number
      startDate?: string
      choreIds?: number[]
      notes?: string
    },
  ): Promise<ApiResponse<Assignment>> {
    const response: AxiosResponse<ApiResponse<Assignment>> =
      await this.client.put(`/api/assignments/${id}`, data)
    return response.data
  }

  async deleteAssignment(id: number): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.delete(
      `/api/assignments/${id}`,
    )
    return response.data
  }

  async updateAssignmentChore(
    assignmentId: number,
    choreId: number,
    data: { status: string },
  ): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.patch(
      `/api/assignments/${assignmentId}/chores/${choreId}`,
      data,
    )
    return response.data
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get(
      '/api/dashboard/stats',
    )

    if (response.data.success && response.data.data) {
      const normalized = this.normalizeDashboardStats(response.data.data)
      return {
        success: true,
        data: normalized,
      }
    }

    return {
      success: false,
      error: response.data.error || 'Failed to load dashboard data',
    }
  }

  // Database test endpoints
  async getDatabaseStats(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.get('/api/test/stats')
    return response.data
  }

  async seedDatabase(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.post(
      '/api/test/seed',
      {},
    )
    return response.data
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> =
      await this.client.get('/health')
    return response.data
  }

  // Get session token for external use
  getSessionToken(): string | null {
    return this.sessionToken
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getSessionTokenFromStorage()
  }

  private normalizeDashboardStats(raw: any): DashboardStats {
    const topPerformersSource = raw?.top_performers ?? raw?.topPerformers ?? []

    const normalizedTopPerformers = Array.isArray(topPerformersSource)
      ? topPerformersSource.map((performer: any) => ({
          childId: performer.child_id ?? performer.childId ?? 0,
          childName: performer.child_name ?? performer.childName ?? '',
          choresCompleted:
            performer.chores_completed ?? performer.choresCompleted ?? 0,
        }))
      : []

    return {
      totalChildren: raw?.total_children ?? raw?.totalChildren ?? 0,
      totalChores: raw?.total_chores ?? raw?.totalChores ?? 0,
      totalAssignments: raw?.total_assignments ?? raw?.totalAssignments ?? 0,
      completedAssignments:
        raw?.completed_assignments ?? raw?.completedAssignments ?? 0,
      pendingAssignments:
        raw?.pending_assignments ?? raw?.pendingAssignments ?? 0,
      thisWeek: {
        assignmentsCompleted:
          raw?.this_week?.assignments_completed ??
          raw?.thisWeek?.assignmentsCompleted ??
          0,
      },
      topPerformers: normalizedTopPerformers,
    }
  }
}

// Export singleton instance
export const api = new ApiClient()
export default api
