const { validationResult } = require('express-validator');
const prisma = require('../config/db');

// @desc    Get all tasks for a program
// @route   GET /api/programs/:programId/tasks
// @access  Private
const getTasksByProgram = async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { programId: req.params.programId },
            orderBy: { orderIndex: 'asc' },
        });
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving tasks' });
    }
};

// @desc    Create a task for a program
// @route   POST /api/programs/:programId/tasks
// @access  Private/Mentor/Admin
const createTask = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, type, contentUrl, mandatory, deadline, orderIndex } = req.body;
    const programId = req.params.programId;

    try {
        // Verify program exists
        const program = await prisma.program.findUnique({ where: { id: programId } });

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                type,
                contentUrl, // YouTube link or other resource URL
                mandatory: mandatory !== undefined ? mandatory : true,
                deadline: deadline ? new Date(deadline) : null,
                orderIndex: orderIndex || 0,
                programId,
                createdById: req.user.id,
            },
        });

        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating task' });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private/Mentor/Admin
const updateTask = async (req, res) => {
    try {
        let task = await prisma.task.findUnique({ where: { id: req.params.id } });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const { title, description, type, contentUrl, mandatory, deadline, orderIndex } = req.body;

        task = await prisma.task.update({
            where: { id: req.params.id },
            data: {
                title: title || task.title,
                description: description || task.description,
                type: type || task.type,
                contentUrl: contentUrl || task.contentUrl,
                mandatory: mandatory !== undefined ? mandatory : task.mandatory,
                deadline: deadline ? new Date(deadline) : task.deadline,
                orderIndex: orderIndex !== undefined ? orderIndex : task.orderIndex,
            },
        });

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating task' });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Mentor/Admin
const deleteTask = async (req, res) => {
    try {
        const task = await prisma.task.findUnique({ where: { id: req.params.id } });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await prisma.task.delete({ where: { id: req.params.id } });

        res.json({ message: 'Task removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting task' });
    }
};

module.exports = {
    getTasksByProgram,
    createTask,
    updateTask,
    deleteTask,
};
