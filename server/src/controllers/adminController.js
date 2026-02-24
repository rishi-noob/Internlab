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
                            select: { id: true, title: true, domain: true, durationDays: true }
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

module.exports = { getAllInterns, getInternById, getAdminStats };
