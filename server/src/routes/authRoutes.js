const express = require('express');
const { body } = require('express-validator');
const {
    registerUser,
    loginUser,
    getMe,
    generateInviteToken,
} = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        // Optional inviteToken for Interns
    ],
    registerUser
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').exists().withMessage('Password is required'),
    ],
    loginUser
);

// Get current user profile (requires auth)
router.get('/me', authenticate, getMe);

// Admin-only route to generate an invite token for a program
router.post(
    '/invite',
    authenticate,
    authorize('ADMIN'),
    [body('programId').notEmpty().withMessage('Program ID is required')],
    generateInviteToken
);

module.exports = router;
