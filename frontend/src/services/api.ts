import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type {
  ApiResponse,
  AuthResponse,
  User,
  Family,
  Chore,
  Assignment,
  LoginRequest,
  SignupRequest,
  CreateChildRequest,
  UpdateUserRequest,
} from '../types/api'

class ApiClient {
  private client: AxiosInstance
  private sessionToken: string | null = null

  constructor(baseURL: string = 'http://localhost:3001') {
    this.client = axios.create({
      baseURL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.sessionToken) {
        config.headers.Authorization = `Bearer ${this.sessionToken}`
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
    const token = localStorage.getItem('sessionToken')
    if (token) {
      this.sessionToken = token
    }
  }

  private saveSessionToken(token: string) {
    this.sessionToken = token
    localStorage.setItem('sessionToken', token)
  }

  private clearSessionToken() {
    this.sessionToken = null
    localStorage.removeItem('sessionToken')
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
    const response: AxiosResponse<AuthResponse> = await this.client.get(
      '/api/auth/me',
    )
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
    const response: AxiosResponse<ApiResponse<User[]>> = await this.client.get(
      '/api/auth/users',
    )
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
    const response: AxiosResponse<ApiResponse<Chore[]>> = await this.client.get(
      '/api/chores',
    )
    return response.data
  }

  async createChore(data: Partial<Chore>): Promise<ApiResponse<Chore>> {
    const response: AxiosResponse<ApiResponse<Chore>> = await this.client.post(
      '/api/chores',
      data,
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

  async createAssignment(
    data: Partial<Assignment>,
  ): Promise<ApiResponse<Assignment>> {
    const response: AxiosResponse<ApiResponse<Assignment>> =
      await this.client.post('/api/assignments', data)
    return response.data
  }

  // Database test endpoints
  async getDatabaseStats(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.client.get(
      '/api/test/stats',
    )
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
    const response: AxiosResponse<ApiResponse> = await this.client.get(
      '/health',
    )
    return response.data
  }

  // Get session token for external use
  getSessionToken(): string | null {
    return this.sessionToken
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.sessionToken
  }
}

// Export singleton instance
export const api = new ApiClient()
export default api
