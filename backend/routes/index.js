const express = require('express')
const router = express.Router()

// Import route modules
const authRoutes = require('./auth')
const childrenRoutes = require('./children')
const choresRoutes = require('./chores')
const assignmentsRoutes = require('./assignments')

// Mount route modules
router.use('/auth', authRoutes)
router.use('/children', childrenRoutes)
router.use('/chores', choresRoutes)
router.use('/assignments', assignmentsRoutes)

// Dashboard/Stats endpoint
router.get('/dashboard/stats', (req, res) => {
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

module.exports = router
