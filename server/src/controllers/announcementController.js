const prisma = require('../config/db');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (any authenticated user)
const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: {
                    select: { id: true, name: true }
                }
            }
        });
        res.json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching announcements' });
    }
};

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
    const { title, content, type } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                type: type || 'GENERAL',
                createdById: req.user.id,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true }
                }
            }
        });
        res.status(201).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating announcement' });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await prisma.announcement.findUnique({
            where: { id: req.params.id }
        });

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        await prisma.announcement.delete({ where: { id: req.params.id } });
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting announcement' });
    }
};

module.exports = { getAllAnnouncements, createAnnouncement, deleteAnnouncement };
