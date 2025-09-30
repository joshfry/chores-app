/**
 * Express App Setup
 * Configures middleware, routes, and error handling
 */

import express, { Request, Response, Application } from 'express'
import cors from 'cors'

import config from './config/server'
import requestLogger from './middleware/logger'
import {
  validateAcceptHeader,
  validateContentType,
} from './middleware/json-only'
import apiRoutes from './routes/index'
import basicRoutes from './routes/basic'

const app: Application = express()

// Basic middleware
app.use(cors(config.cors))
app.use(express.json())
app.use(requestLogger)

// JSON-only middleware for API routes
app.use('/api', validateAcceptHeader)
app.use('/api', validateContentType)

// Routes
app.use('/api', apiRoutes)
app.use(basicRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
  })
})

export default app
