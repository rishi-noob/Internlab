const express = require('express');
const { body } = require('express-validator');
const {
    enrollIntern,
    getEnrollments,
    getMyEnrollments,
    extendEnrollment
} = require('../controllers/enrollmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get own enrollments (Intern)
router.get('/my', authenticate, getMyEnrollments);

// Get all enrollments (Admin)
router.get('/', authenticate, authorize('ADMIN'), getEnrollments);

// Enroll in a program via invite token or admin action
router.post(
    '/',
    authenticate,
    [body('inviteToken').notEmpty().withMessage('Invite token is required')],
    enrollIntern
);

// Extend an enrollment duration (Admin)
router.put(
    '/:id/extend',
    authenticate,
    authorize('ADMIN'),
    [body('days').isInt({ min: 1 }).withMessage('Days to extend must be >= 1')],
    extendEnrollment
);

module.exports = router;
