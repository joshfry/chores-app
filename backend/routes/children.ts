import express, { Request, Response } from 'express'

const router = express.Router()

// GET /children - Get all children
router.get('/', (req: Request, res: Response) => {
  // TODO: Connect to database
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Alice',
        birthdate: '2015-03-15',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Bob',
        birthdate: '2017-08-22',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
  })
})

// GET /children/:id - Get specific child
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  // TODO: Connect to database
  res.json({
    success: true,
    data: {
      id: parseInt(id),
      name: 'Alice',
      birthdate: '2015-03-15',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  })
})

// POST /children - Create new child
router.post('/', (req: Request, res: Response) => {
  const { name, birthdate } = req.body

  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Name is required',
    })
  }

  // TODO: Connect to database
  res.status(201).json({
    success: true,
    data: {
      id: 3,
      name,
      birthdate: birthdate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  })
})

// PUT /children/:id - Update child
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const { name, birthdate } = req.body

  // TODO: Connect to database and validate child exists
  res.json({
    success: true,
    data: {
      id: parseInt(id),
      name: name || 'Alice',
      birthdate: birthdate || '2015-03-15',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    },
  })
})

// DELETE /children/:id - Delete child
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params

  // TODO: Connect to database and validate child exists
  res.json({
    success: true,
    message: 'Child deleted successfully',
  })
})

// GET /children/:id/points - Get child's points summary
router.get('/:id/points', (req: Request, res: Response) => {
  const { id } = req.params

  // TODO: Calculate from assignments
  res.json({
    success: true,
    data: {
      child_id: parseInt(id),
      total_points_earned: 45,
      points_this_week: 12,
      points_this_month: 28,
      completed_chores_count: 15,
    },
  })
})

// GET /children/:id/assignments - Get child's assignments
router.get('/:id/assignments', (req: Request, res: Response) => {
  const { id } = req.params
  const { status } = req.query

  // TODO: Filter assignments by child_id and optional status
  res.json({
    success: true,
    data: [
      {
        id: 1,
        child_id: parseInt(id),
        chore_id: 1,
        chore_title: 'Clean room',
        assigned_date: '2024-01-15',
        due_date: '2024-01-16',
        status: 'completed',
        points_earned: 5,
        completed_date: '2024-01-16T10:30:00Z',
      },
    ],
  })
})

export default router
