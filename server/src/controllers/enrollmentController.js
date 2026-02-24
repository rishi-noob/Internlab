const { validationResult } = require('express-validator');
const prisma = require('../config/db');

// @desc    Enroll intern in program using short invite code
// @route   POST /api/enrollments
// @access  Private
const enrollIntern = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { inviteToken } = req.body;

    try {
        // Look up the short code
        const invite = await prisma.inviteCode.findUnique({
            where: { code: inviteToken.trim().toUpperCase() }
        });

        if (!invite) {
            return res.status(400).json({ message: 'Invalid invite code' });
        }

        if (invite.used) {
            return res.status(400).json({ message: 'This invite code has already been used' });
        }

        if (new Date() > new Date(invite.expiresAt)) {
            return res.status(400).json({ message: 'This invite code has expired' });
        }

        const programId = invite.programId;

        // Check if program exists
        const program = await prisma.program.findUnique({ where: { id: programId } });
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: { userId: req.user.id, programId }
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'You are already enrolled in this program' });
        }

        // Calculate expiration
        const enrolledAt = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + program.durationDays);

        const enrollment = await prisma.enrollment.create({
            data: {
                userId: req.user.id,
                programId: program.id,
                status: 'ACTIVE',
                enrolledAt,
                expiresAt,
            },
        });

        // Populate initial progress for all tasks in this program
        const tasks = await prisma.task.findMany({ where: { programId } });

        if (tasks.length > 0) {
            const progressData = tasks.map(task => ({
                enrollmentId: enrollment.id,
                taskId: task.id,
                status: 'NOT_STARTED'
            }));

            await prisma.userProgress.createMany({
                data: progressData
            });
        }

        res.status(201).json(enrollment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during enrollment' });
    }
};

// @desc    Get all enrollments (for admin dashboard)
// @route   GET /api/enrollments
// @access  Private/Admin
const getEnrollments = async (req, res) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            include: {
                user: { select: { name: true, email: true } },
                program: { select: { title: true } }
            }
        });
        res.json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving enrollments' });
    }
};

// @desc    Get currently logged in user's enrollments
// @route   GET /api/enrollments/my
// @access  Private
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: req.user.id },
            include: {
                program: true,
                UserProgress: {
                    include: { task: true }
                }
            }
        });
        res.json(enrollments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving your enrollments' });
    }
};

// @desc    Extend internship duration
// @route   PUT /api/enrollments/:id/extend
// @access  Private/Admin
const extendEnrollment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { days } = req.body;

    try {
        const enrollment = await prisma.enrollment.findUnique({ where: { id: req.params.id } });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        const newExpiresAt = new Date(enrollment.expiresAt);
        newExpiresAt.setDate(newExpiresAt.getDate() + days);

        const updated = await prisma.enrollment.update({
            where: { id: req.params.id },
            data: {
                expiresAt: newExpiresAt,
                status: enrollment.status === 'COMPLETED' ? 'COMPLETED' : 'EXTENDED'
            }
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error extending enrollment' });
    }
};

module.exports = {
    enrollIntern,
    getEnrollments,
    getMyEnrollments,
    extendEnrollment
};
