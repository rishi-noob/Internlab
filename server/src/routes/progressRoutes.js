const express = require('express');
const { body } = require('express-validator');
const {
    markTaskComplete,
    getEnrollmentProgress,
    gradeSubmission,
    getProgressStats
} = require('../controllers/progressController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get progress for a specific enrollment (Intern/Mentor/Admin)
router.get('/enrollment/:enrollmentId', authenticate, getEnrollmentProgress);

// Mark a task as complete (+ submit work if needed) (Intern)
router.post(
    '/:taskId/complete',
    authenticate,
    markTaskComplete
);

// Grade a submission (Mentor/Admin)
router.put(
    '/:id/grade',
    authenticate,
    authorize('ADMIN', 'MENTOR'),
    [body('grade').notEmpty().withMessage('Grade is required')],
    gradeSubmission
);

// Get aggregate stats (Admin)
router.get('/stats', authenticate, authorize('ADMIN'), getProgressStats);

module.exports = router;
