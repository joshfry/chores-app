const express = require("express");
const router = express.Router();

// GET /assignments - Get all assignments with optional filtering
router.get("/", (req, res) => {
  const { child_id, status, chore_id } = req.query;

  // TODO: Connect to database and apply filters
  let mockData = [
    {
      id: 1,
      child_id: 1,
      child_name: "Alice",
      chore_id: 1,
      chore_title: "Clean bedroom",
      chore_description: "Make bed, organize toys, vacuum floor",
      assigned_date: "2024-01-15",
      due_date: "2024-01-16",
      status: "completed",
      completed_date: "2024-01-16T10:30:00Z",
      points_earned: 5,
      notes: null,
      created_at: "2024-01-15T08:00:00Z",
      updated_at: "2024-01-16T10:30:00Z",
    },
    {
      id: 2,
      child_id: 2,
      child_name: "Bob",
      chore_id: 2,
      chore_title: "Take out trash",
      chore_description: "Empty all trash cans and take to curb",
      assigned_date: "2024-01-16",
      due_date: "2024-01-17",
      status: "in_progress",
      completed_date: null,
      points_earned: 3,
      notes: "Started but not finished",
      created_at: "2024-01-16T09:00:00Z",
      updated_at: "2024-01-16T15:00:00Z",
    },
  ];

  // Apply filters (mock filtering)
  if (child_id) {
    mockData = mockData.filter((a) => a.child_id === parseInt(child_id));
  }
  if (status) {
    mockData = mockData.filter((a) => a.status === status);
  }
  if (chore_id) {
    mockData = mockData.filter((a) => a.chore_id === parseInt(chore_id));
  }

  res.json({
    success: true,
    data: mockData,
  });
});

// GET /assignments/:id - Get specific assignment
router.get("/:id", (req, res) => {
  const { id } = req.params;

  // TODO: Connect to database
  res.json({
    success: true,
    data: {
      id: parseInt(id),
      child_id: 1,
      child_name: "Alice",
      chore_id: 1,
      chore_title: "Clean bedroom",
      chore_description: "Make bed, organize toys, vacuum floor",
      assigned_date: "2024-01-15",
      due_date: "2024-01-16",
      status: "completed",
      completed_date: "2024-01-16T10:30:00Z",
      points_earned: 5,
      notes: null,
      created_at: "2024-01-15T08:00:00Z",
      updated_at: "2024-01-16T10:30:00Z",
    },
  });
});

// POST /assignments - Create new assignment
router.post("/", (req, res) => {
  const { child_id, chore_id, assigned_date, due_date, notes } = req.body;

  if (!child_id || !chore_id || !assigned_date) {
    return res.status(400).json({
      success: false,
      error: "child_id, chore_id, and assigned_date are required",
    });
  }

  // Validate date format (basic check)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(assigned_date)) {
    return res.status(400).json({
      success: false,
      error: "assigned_date must be in YYYY-MM-DD format",
    });
  }

  if (due_date && !dateRegex.test(due_date)) {
    return res.status(400).json({
      success: false,
      error: "due_date must be in YYYY-MM-DD format",
    });
  }

  // TODO: Validate child_id and chore_id exist in database
  // TODO: Get points from chore table

  res.status(201).json({
    success: true,
    data: {
      id: 3,
      child_id,
      child_name: "Alice", // TODO: Get from database
      chore_id,
      chore_title: "Clean bedroom", // TODO: Get from database
      assigned_date,
      due_date: due_date || null,
      status: "assigned",
      completed_date: null,
      points_earned: 5, // TODO: Get from chore.points
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
});

// PUT /assignments/:id - Update assignment
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { status, due_date, notes } = req.body;

  if (
    status &&
    !["assigned", "in_progress", "completed", "missed"].includes(status)
  ) {
    return res.status(400).json({
      success: false,
      error: "Status must be: assigned, in_progress, completed, or missed",
    });
  }

  if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return res.status(400).json({
      success: false,
      error: "due_date must be in YYYY-MM-DD format",
    });
  }

  // TODO: Connect to database and validate assignment exists
  const completed_date =
    status === "completed" ? new Date().toISOString() : null;

  res.json({
    success: true,
    data: {
      id: parseInt(id),
      child_id: 1,
      child_name: "Alice",
      chore_id: 1,
      chore_title: "Clean bedroom",
      assigned_date: "2024-01-15",
      due_date: due_date || "2024-01-16",
      status: status || "assigned",
      completed_date,
      points_earned: 5,
      notes: notes || null,
      created_at: "2024-01-15T08:00:00Z",
      updated_at: new Date().toISOString(),
    },
  });
});

// PATCH /assignments/:id/complete - Quick complete assignment
router.patch("/:id/complete", (req, res) => {
  const { id } = req.params;

  // TODO: Connect to database and validate assignment exists
  res.json({
    success: true,
    data: {
      id: parseInt(id),
      child_id: 1,
      child_name: "Alice",
      chore_id: 1,
      chore_title: "Clean bedroom",
      assigned_date: "2024-01-15",
      due_date: "2024-01-16",
      status: "completed",
      completed_date: new Date().toISOString(),
      points_earned: 5,
      notes: null,
      created_at: "2024-01-15T08:00:00Z",
      updated_at: new Date().toISOString(),
    },
  });
});

// DELETE /assignments/:id - Delete assignment
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // TODO: Connect to database and validate assignment exists
  res.json({
    success: true,
    message: "Assignment deleted successfully",
  });
});

module.exports = router;
