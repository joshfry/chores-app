import express, { Request, Response, Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router: Router = express.Router()

// Get all assignments for authenticated user's family
router.get(
  '/',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user

      const assignments = await prisma.assignment.findMany({
        where: { familyId: user.familyId },
        include: {
          child: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignmentChores: {
            include: {
              chore: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      })

      res.json({
        success: true,
        data: assignments.map((assignment) => ({
          id: assignment.id,
          childId: assignment.childId,
          childName: assignment.child.name,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          status: assignment.status,
          notes: assignment.notes,
          chores: assignment.assignmentChores.map((ac) => ({
            id: ac.id,
            assignmentId: ac.assignmentId,
            choreId: ac.choreId,
            status: ac.status,
            completedOn: ac.completedOn,
            chore: {
              id: ac.chore.id,
              title: ac.chore.title,
              description: ac.chore.description,
              isRecurring: ac.chore.isRecurring,
              recurrenceDays: ac.chore.recurrenceDays
                ? JSON.parse(ac.chore.recurrenceDays)
                : [],
            },
          })),
        })),
      })
    } catch (error) {
      console.error('Error fetching assignments:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
)

// Create new assignment
router.post(
  '/',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user
      const { childId, startDate, choreIds, notes } = req.body

      if (!childId || !startDate || !choreIds || choreIds.length === 0) {
        res.status(400).json({
          success: false,
          error: 'childId, startDate, and choreIds are required',
        })
        return
      }

      // Calculate end date (6 days after start - Saturday)
      const start = new Date(startDate)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      const endDate = end.toISOString().split('T')[0]

      // Fetch chores to check for recurring ones
      const chores = await prisma.chore.findMany({
        where: { id: { in: choreIds.map((id: number) => Number(id)) } },
      })

      // Expand recurring chores into daily records
      const assignmentChoreData: Array<{
        choreId: number
        status: 'pending' | 'completed' | 'skipped'
        completedOn: string | null
      }> = []

      for (const chore of chores) {
        const recurrenceDays = chore.recurrenceDays
          ? JSON.parse(chore.recurrenceDays)
          : []

        if (recurrenceDays.length > 0) {
          // Expand "everyday" into individual days (Monday-Saturday)
          let daysToCreate = recurrenceDays
          if (recurrenceDays.includes('everyday')) {
            daysToCreate = [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
            ]
          }

          // Create one record per recurrence day
          for (const day of daysToCreate) {
            assignmentChoreData.push({
              choreId: chore.id,
              status: 'pending',
              completedOn: day,
            })
          }
        } else {
          // Non-recurring chore: single record with null completedOn
          assignmentChoreData.push({
            choreId: chore.id,
            status: 'pending',
            completedOn: null,
          })
        }
      }

      const assignment = await prisma.assignment.create({
        data: {
          childId: parseInt(childId),
          startDate,
          endDate,
          status: 'assigned',
          notes: notes || null,
          familyId: user.familyId,
          assignmentChores: {
            create: assignmentChoreData,
          },
        },
        include: {
          assignmentChores: {
            include: {
              chore: true,
            },
          },
        },
      })

      res.status(201).json({
        success: true,
        data: {
          id: assignment.id,
          childId: assignment.childId,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          status: assignment.status,
          notes: assignment.notes,
          chores: assignment.assignmentChores.map((ac: any) => ({
            id: ac.id,
            assignmentId: ac.assignmentId,
            choreId: ac.choreId,
            status: ac.status,
            completedOn: ac.completedOn,
            chore: {
              id: ac.chore.id,
              title: ac.chore.title,
              description: ac.chore.description,
              isRecurring: ac.chore.isRecurring,
              recurrenceDays: ac.chore.recurrenceDays
                ? JSON.parse(ac.chore.recurrenceDays)
                : [],
            },
          })),
        },
      })
    } catch (error) {
      console.error('Error creating assignment:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
)

// Update assignment
router.put(
  '/:id',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const user = (req as any).user
      const { childId, startDate, choreIds, notes } = req.body

      // Verify assignment exists and belongs to user's family
      const existingAssignment = await prisma.assignment.findFirst({
        where: {
          id: parseInt(id),
          familyId: user.familyId,
        },
      })

      if (!existingAssignment) {
        res.status(404).json({
          success: false,
          error: 'Assignment not found',
        })
        return
      }

      // Calculate end date if start date changed
      let endDate = existingAssignment.endDate
      if (startDate && startDate !== existingAssignment.startDate) {
        const start = new Date(startDate)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        endDate = end.toISOString().split('T')[0]
      }

      // Update assignment and handle chores if provided
      const updateData: any = {
        childId: childId ? parseInt(childId) : existingAssignment.childId,
        startDate: startDate || existingAssignment.startDate,
        endDate: endDate,
        notes: notes !== undefined ? notes : existingAssignment.notes,
      }

      // If choreIds are provided, update the assignment chores
      if (choreIds && Array.isArray(choreIds)) {
        // Delete existing assignment chores
        await prisma.assignmentChore.deleteMany({
          where: { assignmentId: parseInt(id) },
        })

        // Fetch chores to check for recurring ones
        const chores = await prisma.chore.findMany({
          where: { id: { in: choreIds.map((cid: number) => Number(cid)) } },
        })

        // Expand recurring chores into daily records
        const assignmentChoreData: Array<{
          choreId: number
          status: 'pending' | 'completed' | 'skipped'
          completedOn: string | null
        }> = []

        for (const chore of chores) {
          const recurrenceDays = chore.recurrenceDays
            ? JSON.parse(chore.recurrenceDays)
            : []

          if (recurrenceDays.length > 0) {
            // Expand "everyday" into individual days (Monday-Saturday)
            let daysToCreate = recurrenceDays
            if (recurrenceDays.includes('everyday')) {
              daysToCreate = [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
              ]
            }

            // Create one record per recurrence day
            for (const day of daysToCreate) {
              assignmentChoreData.push({
                choreId: chore.id,
                status: 'pending',
                completedOn: day,
              })
            }
          } else {
            // Non-recurring chore: single record with null completedOn
            assignmentChoreData.push({
              choreId: chore.id,
              status: 'pending',
              completedOn: null,
            })
          }
        }

        // Create new assignment chores
        updateData.assignmentChores = {
          create: assignmentChoreData,
        }
      }

      const assignment = await prisma.assignment.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          assignmentChores: {
            include: {
              chore: true,
            },
          },
          child: true,
        },
      })

      res.json({
        success: true,
        data: {
          id: assignment.id,
          childId: assignment.childId,
          childName: assignment.child.name,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          status: assignment.status,
          notes: assignment.notes,
          chores: assignment.assignmentChores.map((ac) => ({
            id: ac.id,
            assignmentId: ac.assignmentId,
            choreId: ac.choreId,
            status: ac.status,
            completedOn: ac.completedOn,
            chore: {
              id: ac.chore.id,
              title: ac.chore.title,
              description: ac.chore.description,
              isRecurring: ac.chore.isRecurring,
              recurrenceDays: ac.chore.recurrenceDays
                ? JSON.parse(ac.chore.recurrenceDays)
                : [],
            },
          })),
        },
      })
    } catch (error) {
      console.error('Error updating assignment:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
)

// Update assignment chore status
router.patch(
  '/:assignmentId/chores/:choreId',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { assignmentId, choreId } = req.params
      const { status, completedOn } = req.body

      // Find the specific day's assignment chore record
      const assignmentChore = await prisma.assignmentChore.findFirst({
        where: {
          assignmentId: parseInt(assignmentId),
          choreId: parseInt(choreId),
          completedOn: completedOn || null,
        },
      })

      if (!assignmentChore) {
        res.status(404).json({
          success: false,
          error: 'Assignment chore not found',
        })
        return
      }

      const updated = await prisma.assignmentChore.update({
        where: { id: assignmentChore.id },
        data: {
          status: status || 'completed',
        },
      })

      res.json({
        success: true,
        data: updated,
      })
    } catch (error) {
      console.error('Error updating assignment chore:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
)

// Delete assignment
router.delete(
  '/:id',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
      const user = (req as any).user

      const assignment = await prisma.assignment.findFirst({
        where: {
          id: parseInt(id),
          familyId: user.familyId,
        },
      })

      if (!assignment) {
        res.status(404).json({
          success: false,
          error: 'Assignment not found',
        })
        return
      }

      await prisma.assignment.delete({
        where: { id: parseInt(id) },
      })

      res.json({
        success: true,
        message: 'Assignment deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting assignment:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  },
)

export default router
