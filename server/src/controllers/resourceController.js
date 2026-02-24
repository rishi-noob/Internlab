const prisma = require('../config/db');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
const getAllResources = async (req, res) => {
    try {
        const resources = await prisma.resource.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: {
                    select: { id: true, name: true }
                }
            }
        });
        res.json(resources);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching resources' });
    }
};

// @desc    Create a resource
// @route   POST /api/resources
// @access  Private/Admin
const createResource = async (req, res) => {
    const { title, url, description, category } = req.body;

    if (!title || !url) {
        return res.status(400).json({ message: 'Title and URL are required' });
    }

    try {
        const resource = await prisma.resource.create({
            data: {
                title,
                url,
                description: description || null,
                category: category || null,
                createdById: req.user.id,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true }
                }
            }
        });
        res.status(201).json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating resource' });
    }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
const deleteResource = async (req, res) => {
    try {
        const resource = await prisma.resource.findUnique({
            where: { id: req.params.id }
        });

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        await prisma.resource.delete({ where: { id: req.params.id } });
        res.json({ message: 'Resource deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting resource' });
    }
};

module.exports = { getAllResources, createResource, deleteResource };
