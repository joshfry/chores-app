import express, { Request, Response, Router } from 'express'

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
