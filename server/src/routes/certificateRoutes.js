const express = require('express');
const { validationResult } = require('express-validator');
const prisma = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @desc    Generate a simple certificate hash/URL for a completed enrollment
// @route   POST /api/certificates/generate/:enrollmentId
// @access  Private
router.post('/generate/:enrollmentId', authenticate, async (req, res) => {
    try {
        const { enrollmentId } = req.params;

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                user: true,
                program: true,
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        if (enrollment.userId !== req.user.id && req.user.role === 'INTERN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (enrollment.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Internship is not fully completed yet' });
        }

        // In a real app we'd trigger a PDF generation service here.
        // For MVP, we'll just generate a unique verification hash/URL
        const certificateUrl = `https://internlab.demo/verify/${enrollment.id}-${Date.now()}`;

        const updated = await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { certificateUrl }
        });

        res.json({ message: 'Certificate generated successfully', certificateUrl: updated.certificateUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error generating certificate' });
    }
});

module.exports = router;
