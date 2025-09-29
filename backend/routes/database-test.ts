/**
 * Database Test Routes
 * Quick proof-of-concept routes to test Prisma + SQLite
 */

import express, { Request, Response } from 'express'
import * as authModels from '../models/auth-prisma'
import { prisma } from '../lib/prisma'

const router = express.Router()

// GET /test/users - List all users from database
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await authModels.getAllUsers()
    res.json({
      success: true,
      message: `Found ${users.length} users in database`,
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        familyName: user.family?.name,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: (error as Error).message,
    })
  }
})

// GET /test/families - List all families from database
router.get('/families', async (req: Request, res: Response) => {
  try {
    const families = await authModels.getAllFamilies()
    res.json({
      success: true,
      message: `Found ${families.length} families in database`,
      data: families.map((family) => ({
        id: family.id,
        name: family.name,
        createdDate: family.createdDate,
        userCount: family.users.length,
        choreCount: family.chores.length,
        assignmentCount: family.assignments.length,
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: (error as Error).message,
    })
  }
})

// POST /test/seed - Seed database with sample data
router.post('/seed', async (req: Request, res: Response) => {
  try {
    await authModels.seedDatabase()
    res.json({
      success: true,
      message: 'Database seeded successfully! 🌱',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Seeding failed',
      message: (error as Error).message,
    })
  }
})

// GET /test/stats - Database statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [userCount, familyCount, choreCount, assignmentCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.family.count(),
        prisma.chore.count(),
        prisma.assignment.count(),
      ])

    res.json({
      success: true,
      message: 'Database statistics',
      data: {
        users: userCount,
        families: familyCount,
        chores: choreCount,
        assignments: assignmentCount,
        totalRecords: userCount + familyCount + choreCount + assignmentCount,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Stats query failed',
      message: (error as Error).message,
    })
  }
})

// GET /test/magic-tokens/latest - Fetch most recent unused token for email
router.get('/magic-tokens/latest', async (req: Request, res: Response) => {
  try {
    const { email } = req.query

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Email query parameter is required',
      })
      return
    }

    const token = await prisma.magicToken.findFirst({
      where: {
        user: { email },
        used: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!token) {
      res.status(404).json({
        success: false,
        error: 'No unused magic token found for this email',
      })
      return
    }

    res.json({
      success: true,
      data: {
        token: token.token,
        expiresAt: token.expiresAt,
        user: token.user,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch magic token',
      message: (error as Error).message,
    })
  }
})

export default router
