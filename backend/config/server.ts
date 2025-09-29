/**
 * Server Configuration
 * Centralized configuration for the Express server
 */

export interface ServerConfig {
  port: number
  env: string
  cors: {
    origin: string
    credentials: boolean
  }
}

const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  env: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
}

export default config
