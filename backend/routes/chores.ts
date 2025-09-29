import express, { Request, Response } from 'express'

const router = express.Router()

// GET /chores - Get all chores
router.get('/', (req: Request, res: Response): void => {
  // TODO: Connect to database
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Clean bedroom',
        description: 'Make bed, organize toys, vacuum floor',
        points: 5,
        difficulty: 'medium',
        category: 'cleaning',
        is_recurring: false,
        recurrence_pattern: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        title: 'Take out trash',
        description: 'Empty all trash cans and take to curb',
        points: 3,
        difficulty: 'easy',
        category: 'cleaning',
        is_recurring: true,
        recurrence_pattern: 'weekly',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
  })
})

// GET /chores/:id - Get specific chore
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  // TODO: Connect to database
  res.json({
    success: true,
    data: {
      id: parseInt(id),
      title: 'Clean bedroom',
      description: 'Make bed, organize toys, vacuum floor',
      points: 5,
      difficulty: 'medium',
      category: 'cleaning',
      is_recurring: false,
      recurrence_pattern: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  })
})

// POST /chores - Create new chore
router.post('/', (req: Request, res: Response): void => {
  const {
    title,
    description,
    points = 1,
    difficulty = 'easy',
    category,
    is_recurring = false,
    recurrence_pattern,
  } = req.body

  if (!title) {
    res.status(400).json({
      success: false,
      error: 'Title is required',
    })
  }

  if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
    res.status(400).json({
      success: false,
      error: 'Difficulty must be easy, medium, or hard',
    })
  }

  if (is_recurring && !recurrence_pattern) {
    res.status(400).json({
      success: false,
      error: 'Recurrence pattern required for recurring chores',
    })
  }

  // TODO: Connect to database
  res.status(201).json({
    success: true,
    data: {
      id: 3,
      title,
      description: description || null,
      points,
      difficulty,
      category: category || null,
      is_recurring,
      recurrence_pattern: recurrence_pattern || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  })
})

// PUT /chores/:id - Update chore
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const {
    title,
    description,
    points,
    difficulty,
    category,
    is_recurring,
    recurrence_pattern,
  } = req.body

  if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
    res.status(400).json({
      success: false,
      error: 'Difficulty must be easy, medium, or hard',
    })
  }

  // TODO: Connect to database and validate chore exists
  res.json({
    success: true,
    data: {
      id: parseInt(id),
      title: title || 'Clean bedroom',
      description: description || 'Make bed, organize toys, vacuum floor',
      points: points || 5,
      difficulty: difficulty || 'medium',
      category: category || 'cleaning',
      is_recurring: is_recurring !== undefined ? is_recurring : false,
      recurrence_pattern: recurrence_pattern || null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    },
  })
})

// DELETE /chores/:id - Delete chore
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params

  // TODO: Connect to database and validate chore exists
  res.json({
    success: true,
    message: 'Chore deleted successfully',
  })
})

export default router
