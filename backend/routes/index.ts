import express, { Request, Response, Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router: Router = express.Router()

// Import route modules
import authRoutes from './auth'
import childrenRoutes from './children'
import choresRoutes from './chores'
import assignmentsRoutes from './assignments'
import databaseTestRoutes from './database-test'

// Mount route modules
router.use('/auth', authRoutes)
router.use('/children', childrenRoutes)
router.use('/chores', choresRoutes)
router.use('/assignments', assignmentsRoutes)
router.use('/test', databaseTestRoutes)

// Dashboard/Stats endpoint - Calculate real stats from database
router.get(
  '/dashboard/stats',
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user

      // Get current week's date range (Sunday to Saturday)
      const now = new Date()
      const currentDay = now.getDay()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - currentDay)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      // Query all data in parallel for better performance
      const [totalChildren, totalChores, allAssignments, thisWeekAssignments] =
        await Promise.all([
          // Count active children in family
          prisma.user.count({
            where: {
              familyId: user.familyId,
              role: 'child',
              isActive: true,
            },
          }),

          // Count total chores for family
          prisma.chore.count({
            where: { familyId: user.familyId },
          }),

          // Get all assignments with chores
          prisma.assignment.findMany({
            where: { familyId: user.familyId },
            include: {
              assignmentChores: {
                include: {
                  chore: true,
                },
              },
            },
          }),

          // Get this week's assignments with child info
          prisma.assignment.findMany({
            where: {
              familyId: user.familyId,
              startDate: {
                gte: startOfWeek.toISOString().split('T')[0],
                lte: endOfWeek.toISOString().split('T')[0],
              },
            },
            include: {
              child: {
                select: {
                  id: true,
                  name: true,
                },
              },
              assignmentChores: {
                include: {
                  chore: true,
                },
              },
            },
          }),
        ])

      // Calculate assignment statistics
      const completedAssignments = allAssignments.filter(
        (a) => a.status === 'completed',
      ).length
      const pendingAssignments = allAssignments.filter(
        (a) => a.status === 'assigned' || a.status === 'in_progress',
      ).length

      // Calculate this week's stats
      let thisWeekCompletedAssignments = 0
      const childChoresThisWeek: Record<
        number,
        { name: string; completedCount: number }
      > = {}

      thisWeekAssignments.forEach((assignment) => {
        const completedChores = assignment.assignmentChores.filter(
          (ac) => ac.status === 'completed',
        )

        if (completedChores.length > 0) {
          thisWeekCompletedAssignments++

          // Track completed chores per child
          if (!childChoresThisWeek[assignment.childId]) {
            childChoresThisWeek[assignment.childId] = {
              name: assignment.child.name,
              completedCount: 0,
            }
          }
          childChoresThisWeek[assignment.childId].completedCount +=
            completedChores.length
        }
      })

      // Get top performers (sorted by completed chores this week)
      const topPerformers = Object.entries(childChoresThisWeek)
        .map(([childId, data]) => ({
          child_id: parseInt(childId),
          child_name: data.name,
          chores_completed: data.completedCount,
        }))
        .sort((a, b) => b.chores_completed - a.chores_completed)
        .slice(0, 5) // Top 5 performers

      res.json({
        success: true,
        data: {
          total_children: totalChildren,
          total_chores: totalChores,
          total_assignments: allAssignments.length,
          completed_assignments: completedAssignments,
          pending_assignments: pendingAssignments,
          this_week: {
            assignments_completed: thisWeekCompletedAssignments,
          },
          top_performers: topPerformers,
        },
      })
    } catch (error) {
      console.error('Dashboard stats error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to calculate dashboard statistics',
        message: (error as Error).message,
      })
    }
  },
)

export default router
