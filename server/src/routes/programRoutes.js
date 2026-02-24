const express = require('express');
const { body } = require('express-validator');
const {
    getPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
} = require('../controllers/programController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all programs (Interns see all active, Mentors/Admins see all)
router.get('/', authenticate, getPrograms);

// GET a specific program by ID
router.get('/:id', authenticate, getProgramById);

// POST create a new program (Admin only)
router.post(
    '/',
    authenticate,
    authorize('ADMIN'),
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('durationDays').isInt({ min: 1 }).withMessage('Duration is required'),
        body('startDate').isISO8601().withMessage('Valid start date required'),
        body('endDate').isISO8601().withMessage('Valid end date required'),
    ],
    createProgram
);

// PUT update a program (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), updateProgram);

// DELETE a program (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProgram);

module.exports = router;
