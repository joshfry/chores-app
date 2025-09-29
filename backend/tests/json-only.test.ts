/**
 * Tests for JSON-Only API middleware
 */

import request from 'supertest'
import app from '../app'

describe('JSON-Only API Middleware', () => {
  describe('Accept Header Validation', () => {
    it('should accept requests with Accept: application/json', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Accept', 'application/json')

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toMatch(/json/)
      expect(response.body.success).toBe(true)
    })

    it('should accept requests with Accept: */*', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Accept', '*/*')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should accept requests with Accept: application/*, */*', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Accept', 'application/*, */*')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should reject requests with Accept: text/html', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Accept', 'text/html')

      expect(response.status).toBe(406)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Not Acceptable')
    })

    it('should reject requests with Accept: text/html, application/xhtml+xml', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Accept', 'text/html, application/xhtml+xml')

      expect(response.status).toBe(406)
      expect(response.body.success).toBe(false)
    })

    it('should accept requests with empty Accept header (fallback behavior)', async () => {
      // Express.js accepts() method returns truthy for empty Accept headers as fallback
      const response = await request(app).get('/api/children').set('Accept', '') // Empty Accept header - should be accepted as fallback

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('Content-Type Validation for POST/PUT/PATCH', () => {
    it('should accept POST with Content-Type: application/json', async () => {
      const response = await request(app)
        .post('/api/children')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ name: 'Test Child', birthdate: '2015-01-01' })

      expect(response.status).toBe(201)
    })

    it('should reject POST with Content-Type: application/x-www-form-urlencoded', async () => {
      const response = await request(app)
        .post('/api/children')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('name=Test Child&birthdate=2015-01-01')

      expect(response.status).toBe(415)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Unsupported Media Type')
    })

    it('should reject PUT with wrong Content-Type', async () => {
      const response = await request(app)
        .put('/api/children/1')
        .set('Accept', 'application/json')
        .set('Content-Type', 'text/plain')
        .send('name=Test Child')

      expect(response.status).toBe(415)
      expect(response.body.success).toBe(false)
    })

    it('should reject PATCH with wrong Content-Type', async () => {
      const response = await request(app)
        .patch('/api/assignments/1/complete')
        .set('Accept', 'application/json')
        .set('Content-Type', 'multipart/form-data')

      expect(response.status).toBe(415)
    })

    it('should allow GET without Content-Type validation', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Accept', 'application/json')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('Non-API Routes Should Work Normally', () => {
    it('health endpoint should work with any Accept header', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept', 'text/html')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('root endpoint should work with any Accept header', async () => {
      const response = await request(app).get('/').set('Accept', 'text/html')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('health endpoint should work with no Accept header', async () => {
      const response = await request(app).get('/health')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('Various Accept Header Combinations', () => {
    it('should accept Accept: application/json, text/plain, */*', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Accept', 'application/json, text/plain, */*')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should reject Accept: text/xml, text/html (no json)', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Accept', 'text/xml, text/html')

      expect(response.status).toBe(406)
    })

    it('should accept Accept: text/html, application/json (json included)', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Accept', 'text/html, application/json')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })
})
