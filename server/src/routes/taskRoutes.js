const express = require('express');
const { body } = require('express-validator');
const {
    getTasksByProgram,
    createTask,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');

// Merge params to access programId from nested routes if needed
const router = express.Router({ mergeParams: true });

// GET all tasks for a specific program
router.get('/programs/:programId/tasks', authenticate, getTasksByProgram);

// POST create a new task (Mentor or Admin)
router.post(
    '/programs/:programId/tasks',
    authenticate,
    authorize('ADMIN', 'MENTOR'),
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('type').isIn(['VIDEO', 'READING', 'QUIZ']).withMessage('Invalid task type'),
    ],
    createTask
);

// PUT update a task (Mentor or Admin)
router.put(
    '/tasks/:id',
    authenticate,
    authorize('ADMIN', 'MENTOR'),
    updateTask
);

// DELETE a task (Mentor or Admin)
router.delete(
    '/tasks/:id',
    authenticate,
    authorize('ADMIN', 'MENTOR'),
    deleteTask
);

module.exports = router;
