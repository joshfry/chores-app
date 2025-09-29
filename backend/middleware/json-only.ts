/**
 * JSON-Only API Middleware
 * Ensures API routes only serve JSON responses and accept JSON requests
 */

import { Request, Response, NextFunction } from 'express'

export const validateAcceptHeader = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const acceptsJson = req.accepts('json')
  const acceptsHtml = req.accepts('html')

  // If client prefers HTML over JSON, reject the request
  if (acceptsHtml && !acceptsJson) {
    return res
      .status(406)
      .send(
        'This API only serves JSON. Please set Accept: application/json header.',
      )
  }

  // If no Accept header or doesn't include json, reject
  if (!acceptsJson) {
    return res
      .status(406)
      .send(
        'This API only serves JSON. Please set Accept: application/json header.',
      )
  }

  next()
}

export const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json')) {
      return res
        .status(415)
        .send(
          'This API only accepts JSON. Please set Content-Type: application/json header.',
        )
    }
  }
  next()
}
