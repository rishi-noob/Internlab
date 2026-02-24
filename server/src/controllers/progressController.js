const { validationResult } = require('express-validator');
const prisma = require('../config/db');

// @desc    Mark a task as complete or submit work
// @route   POST /api/progress/:taskId/complete
// @access  Private (Intern)
const markTaskComplete = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { submissionUrl } = req.body; // optional e.g. for quiz or code submission link

        // Find the user's active enrollment for the program containing this task
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId: req.user.id,
                programId: task.programId,
            }
        });

        if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this program' });

        // Find or create progress record
        let progress = await prisma.userProgress.findFirst({
            where: { enrollmentId: enrollment.id, taskId }
        });

        if (!progress) {
            progress = await prisma.userProgress.create({
                data: {
                    enrollmentId: enrollment.id,
                    taskId,
                    status: 'COMPLETED',
                    submissionUrl,
                    completedAt: new Date(),
                }
            });
        } else {
            progress = await prisma.userProgress.update({
                where: { id: progress.id },
                data: {
                    status: 'COMPLETED',
                    submissionUrl: submissionUrl || progress.submissionUrl,
                    completedAt: new Date(),
                }
            });
        }

        // Check if all tasks in the program are now complete
        const totalTasks = await prisma.task.count({ where: { programId: task.programId } });
        const completedTasks = await prisma.userProgress.count({
            where: { enrollmentId: enrollment.id, status: 'COMPLETED' }
        });

        if (totalTasks > 0 && completedTasks === totalTasks) {
            await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { status: 'COMPLETED' }
            });
            // Here normally you'd trigger certificate generation
        }

        res.json({ message: 'Task marked complete', progress, allCompleted: completedTasks === totalTasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error marking task complete' });
    }
};

// @desc    Get progress details for an enrollment
// @route   GET /api/progress/enrollment/:enrollmentId
// @access  Private
const getEnrollmentProgress = async (req, res) => {
    try {
        const { enrollmentId } = req.params;

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                program: {
                    include: { Task: { orderBy: { orderIndex: 'asc' } } }
                },
                UserProgress: true
            }
        });

        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

        // Authorization check
        if (enrollment.userId !== req.user.id && req.user.role === 'INTERN') {
            return res.status(403).json({ message: 'Not authorized to view this progress' });
        }

        // Map tasks with their progress
        const progressMap = enrollment.UserProgress.reduce((acc, p) => {
            acc[p.taskId] = p;
            return acc;
        }, {});

        const tasksWithProgress = enrollment.program.Task.map(t => ({
            ...t,
            progress: progressMap[t.id] || { status: 'NOT_STARTED' }
        }));

        const completedCount = enrollment.UserProgress.filter(p => p.status === 'COMPLETED').length;
        const totalCount = enrollment.program.Task.length;
        const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

        res.json({
            enrollmentId: enrollment.id,
            status: enrollment.status,
            percentage,
            tasks: tasksWithProgress
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching progress' });
    }
};

// @desc    Grade a submission
// @route   PUT /api/progress/:id/grade
// @access  Private/Mentor/Admin
const gradeSubmission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const progress = await prisma.userProgress.update({
            where: { id: req.params.id },
            data: { grade: req.body.grade }
        });
        res.json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error grading submission' });
    }
};

// @desc    Get aggregate progress stats
// @route   GET /api/progress/stats
// @access  Private/Admin
const getProgressStats = async (req, res) => {
    try {
        const totalInterns = await prisma.user.count({ where: { role: 'INTERN' } });
        const totalEnrollments = await prisma.enrollment.count();
        const completedEnrollments = await prisma.enrollment.count({ where: { status: 'COMPLETED' } });
        const completionRate = totalEnrollments === 0 ? 0 : Math.round((completedEnrollments / totalEnrollments) * 100);

        const pendingGrades = await prisma.userProgress.count({
            where: { status: 'COMPLETED', grade: null, submissionUrl: { not: null } }
        });

        res.json({
            totalInterns,
            totalEnrollments,
            completedEnrollments,
            completionRate,
            pendingGrades
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

module.exports = {
    markTaskComplete,
    getEnrollmentProgress,
    gradeSubmission,
    getProgressStats
};
