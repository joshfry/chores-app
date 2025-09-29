/**
 * Request Logger Middleware
 * Logs incoming requests with timestamp, method, and path
 */

import { Request, Response, NextFunction } from 'express'

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
}

export default requestLogger
