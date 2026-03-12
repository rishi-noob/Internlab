const prisma = require('../config/db');

// @desc    Get all interns with profile info
// @route   GET /api/admin/interns
// @access  Private/Admin
const getAllInterns = async (req, res) => {
    try {
        const interns = await prisma.user.findMany({
            where: { role: 'INTERN' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                college: true,
                duration: true,
                interests: true,
                createdAt: true,
                Enrollment: {
                    select: {
                        id: true,
                        status: true,
                        enrolledAt: true,
                        program: {
                            select: { id: true, title: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(interns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching interns' });
    }
};

// @desc    Get single intern with full enrollment + progress detail
// @route   GET /api/admin/interns/:id
// @access  Private/Admin
const getInternById = async (req, res) => {
    try {
        const intern = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                college: true,
                duration: true,
                interests: true,
                createdAt: true,
                Enrollment: {
                    include: {
                        program: {
                            include: {
                                Task: {
                                    select: { id: true, title: true, type: true, orderIndex: true },
                                    orderBy: { orderIndex: 'asc' }
                                }
                            }
                        },
                        UserProgress: {
                            include: {
                                task: {
                                    select: { id: true, title: true, type: true, orderIndex: true }
                                }
                            },
                            orderBy: { task: { orderIndex: 'asc' } }
                        }
                    },
                    orderBy: { enrolledAt: 'desc' }
                }
            }
        });

        if (!intern) {
            return res.status(404).json({ message: 'Intern not found' });
        }

        res.json(intern);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching intern' });
    }
};

// @desc    Get admin dashboard stats (expanded)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalLearners = await prisma.user.count({ where: { role: 'INTERN' } });
        const totalPrograms = await prisma.program.count();
        const totalResources = await prisma.resource.count();

        // Get all enrollments with their progress
        const enrollments = await prisma.enrollment.findMany({
            include: {
                UserProgress: true
            }
        });

        const totalEnrollments = enrollments.length;
        const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE' || e.status === 'EXTENDED').length;

        let yetToStart = 0;
        let inProgress = 0;
        let completed = 0;
        let totalProgressPct = 0;
        let totalDaysSpent = 0;
        let enrollmentsWithTasks = 0;

        const now = new Date();

        for (const enr of enrollments) {
            const tasks = enr.UserProgress;
            if (tasks.length === 0) {
                yetToStart++;
                continue;
            }

            const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
            const notStartedCount = tasks.filter(t => t.status === 'NOT_STARTED').length;
            const pct = Math.round((completedCount / tasks.length) * 100);

            totalProgressPct += pct;
            enrollmentsWithTasks++;

            if (notStartedCount === tasks.length) {
                yetToStart++;
            } else if (completedCount === tasks.length) {
                completed++;
            } else {
                inProgress++;
            }

            // Calculate days spent
            const enrolledDate = new Date(enr.enrolledAt);
            const endDate = completedCount === tasks.length && tasks.some(t => t.completedAt)
                ? new Date(Math.max(...tasks.filter(t => t.completedAt).map(t => new Date(t.completedAt))))
                : now;
            const daysSpent = Math.max(1, Math.round((endDate - enrolledDate) / (1000 * 60 * 60 * 24)));
            totalDaysSpent += daysSpent;
        }

        const avgProgress = enrollmentsWithTasks > 0 ? Math.round(totalProgressPct / enrollmentsWithTasks) : 0;
        const avgTimeSpent = totalEnrollments > 0 ? Math.round(totalDaysSpent / totalEnrollments) : 0;

        res.json({
            totalLearners,
            totalPrograms,
            totalResources,
            totalEnrollments,
            activeEnrollments,
            yetToStart,
            inProgress,
            completed,
            avgProgress,
            avgTimeSpent,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching admin stats' });
    }
};

// @desc    Delete a student intern and all their related data
// @route   DELETE /api/admin/interns/:id
// @access  Private/Admin
const deleteIntern = async (req, res) => {
    try {
        const internId = req.params.id;

        // Check if user exists and is actually an intern
        const user = await prisma.user.findUnique({ where: { id: internId } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'INTERN') return res.status(403).json({ message: 'Can only delete intern accounts' });

        // Safely perform cascading delete inside a transaction to prevent partial orphans
        await prisma.$transaction(async (tx) => {
            // First find all enrollments for this user
            const enrollments = await tx.enrollment.findMany({ where: { userId: internId } });
            const enrollmentIds = enrollments.map(e => e.id);

            // 1. Delete all UserProgress rows linked to those enrollments
            if (enrollmentIds.length > 0) {
                await tx.userProgress.deleteMany({
                    where: { enrollmentId: { in: enrollmentIds } }
                });
            }

            // 2. Delete all Enrollments for the user
            await tx.enrollment.deleteMany({
                where: { userId: internId }
            });

            // 3. Delete the User
            await tx.user.delete({
                where: { id: internId }
            });
        });

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error deleting student.' });
    }
};

module.exports = { getAllInterns, getInternById, getAdminStats, deleteIntern };
