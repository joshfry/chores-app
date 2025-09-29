/**
 * JSON-Only API Middleware
 * Ensures API routes only serve JSON responses and accept JSON requests
 */

import { Request, Response, NextFunction } from 'express'

export const validateAcceptHeader = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const acceptsJson = req.accepts('json')
  const acceptsHtml = req.accepts('html')

  // If client prefers HTML over JSON, reject the request
  if (acceptsHtml && !acceptsJson) {
    res.status(406).json({
      success: false,
      error: 'Not Acceptable',
      message:
        'This API only serves JSON. Please set Accept: application/json header.',
    })
    return
  }

  // If no Accept header or doesn't include json, reject
  if (!acceptsJson) {
    res.status(406).json({
      success: false,
      error: 'Not Acceptable',
      message:
        'This API only serves JSON. Please set Accept: application/json header.',
    })
    return
  }

  next()
}

export const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json')) {
      res.status(415).json({
        success: false,
        error: 'Unsupported Media Type',
        message:
          'This API only accepts JSON. Please set Content-Type: application/json header.',
      })
      return
    }
  }
  next()
}
