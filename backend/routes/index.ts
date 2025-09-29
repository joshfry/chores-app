import express, { Request, Response } from 'express'

const router = express.Router()

// Import route modules
import authRoutes from './auth.js'
import childrenRoutes from './children.js'
import choresRoutes from './chores.js'
import assignmentsRoutes from './assignments.js'

// Mount route modules
router.use('/auth', authRoutes)
router.use('/children', childrenRoutes)
router.use('/chores', choresRoutes)
router.use('/assignments', assignmentsRoutes)

// Dashboard/Stats endpoint
router.get('/dashboard/stats', (req: Request, res: Response) => {
  // TODO: Calculate real stats from database
  res.json({
    success: true,
    data: {
      total_children: 2,
      total_chores: 5,
      total_assignments: 12,
      completed_assignments: 8,
      pending_assignments: 4,
      total_points_earned: 67,
      this_week: {
        assignments_completed: 3,
        points_earned: 15,
      },
      top_performers: [
        { child_id: 1, child_name: 'Alice', points_this_week: 12 },
        { child_id: 2, child_name: 'Bob', points_this_week: 8 },
      ],
    },
  })
})

export default router
