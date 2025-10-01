import express, { Request, Response, Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router: Router = express.Router()

// GET /chores - Get all chores for authenticated user's family
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user

      const chores = await prisma.chore.findMany({
        where: { familyId: user.familyId },
        orderBy: { createdAt: 'desc' },
      })

      res.json({
        success: true,
        data: chores.map((chore) => ({
          id: chore.id,
          title: chore.title,
          description: chore.description,
          difficulty: chore.difficulty,
          category: chore.category,
          isRecurring: chore.isRecurring,
          recurrenceDays: chore.recurrenceDays
            ? JSON.parse(chore.recurrenceDays)
            : null,
          familyId: chore.familyId,
          createdAt: chore.createdAt,
          updatedAt: chore.updatedAt,
        })),
      })
    } catch (error) {
      console.error('Error fetching chores:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
)

// GET /chores/:id - Get specific chore
router.get(
  '/:id',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const user = (req as any).user

      const chore = await prisma.chore.findFirst({
        where: {
          id: parseInt(id),
          familyId: user.familyId,
        },
      })

      if (!chore) {
        res.status(404).json({
          success: false,
          error: 'Chore not found',
        })
        return
      }

      res.json({
        success: true,
        data: {
          id: chore.id,
          title: chore.title,
          description: chore.description,
          difficulty: chore.difficulty,
          category: chore.category,
          isRecurring: chore.isRecurring,
          recurrenceDays: chore.recurrenceDays
            ? JSON.parse(chore.recurrenceDays)
            : null,
          familyId: chore.familyId,
          createdAt: chore.createdAt,
          updatedAt: chore.updatedAt,
        },
      })
    } catch (error) {
      console.error('Error fetching chore:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
)

// POST /chores - Create new chore
router.post(
  '/',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user
      const {
        title,
        description,
        difficulty = 'easy',
        category,
        isRecurring = false,
        recurrenceDays,
      } = req.body

      if (!title) {
        res.status(400).json({
          success: false,
          error: 'Title is required',
        })
        return
      }

      if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
        res.status(400).json({
          success: false,
          error: 'Difficulty must be easy, medium, or hard',
        })
        return
      }

      const chore = await prisma.chore.create({
        data: {
          title,
          description: description || null,
          difficulty,
          category: category || null,
          isRecurring,
          recurrenceDays:
            isRecurring && recurrenceDays && recurrenceDays.length > 0
              ? JSON.stringify(recurrenceDays)
              : null,
          familyId: user.familyId,
        },
      })

      res.status(201).json({
        success: true,
        data: {
          id: chore.id,
          title: chore.title,
          description: chore.description,
          difficulty: chore.difficulty,
          category: chore.category,
          isRecurring: chore.isRecurring,
          recurrenceDays: chore.recurrenceDays
            ? JSON.parse(chore.recurrenceDays)
            : null,
          familyId: chore.familyId,
          createdAt: chore.createdAt,
          updatedAt: chore.updatedAt,
        },
      })
    } catch (error) {
      console.error('Error creating chore:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
)

// PUT /chores/:id - Update chore
router.put(
  '/:id',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const user = (req as any).user
      const {
        title,
        description,
        difficulty,
        category,
        isRecurring,
        recurrenceDays,
      } = req.body

      if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
        res.status(400).json({
          success: false,
          error: 'Difficulty must be easy, medium, or hard',
        })
        return
      }

      const existingChore = await prisma.chore.findFirst({
        where: {
          id: parseInt(id),
          familyId: user.familyId,
        },
      })

      if (!existingChore) {
        res.status(404).json({
          success: false,
          error: 'Chore not found',
        })
        return
      }

      const chore = await prisma.chore.update({
        where: { id: parseInt(id) },
        data: {
          title: title || existingChore.title,
          description:
            description !== undefined ? description : existingChore.description,
          difficulty: difficulty || existingChore.difficulty,
          category: category !== undefined ? category : existingChore.category,
          isRecurring:
            isRecurring !== undefined ? isRecurring : existingChore.isRecurring,
          recurrenceDays:
            isRecurring && recurrenceDays && recurrenceDays.length > 0
              ? JSON.stringify(recurrenceDays)
              : null,
        },
      })

      res.json({
        success: true,
        data: {
          id: chore.id,
          title: chore.title,
          description: chore.description,
          difficulty: chore.difficulty,
          category: chore.category,
          isRecurring: chore.isRecurring,
          recurrenceDays: chore.recurrenceDays
            ? JSON.parse(chore.recurrenceDays)
            : null,
          familyId: chore.familyId,
          createdAt: chore.createdAt,
          updatedAt: chore.updatedAt,
        },
      })
    } catch (error) {
      console.error('Error updating chore:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
)

// DELETE /chores/:id - Delete chore
router.delete(
  '/:id',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const user = (req as any).user

      const chore = await prisma.chore.findFirst({
        where: {
          id: parseInt(id),
          familyId: user.familyId,
        },
      })

      if (!chore) {
        res.status(404).json({
          success: false,
          error: 'Chore not found',
        })
        return
      }

      await prisma.chore.delete({
        where: { id: parseInt(id) },
      })

      res.json({
        success: true,
        message: 'Chore deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting chore:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
)

export default router
