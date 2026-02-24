const { validationResult } = require('express-validator');
const prisma = require('../config/db');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Private
const getPrograms = async (req, res) => {
    try {
        const programs = await prisma.program.findMany({
            include: {
                _count: {
                    select: { Enrollment: true, Task: true }
                }
            }
        });
        res.json(programs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving programs' });
    }
};

// @desc    Get single program by ID
// @route   GET /api/programs/:id
// @access  Private
const getProgramById = async (req, res) => {
    try {
        const program = await prisma.program.findUnique({
            where: { id: req.params.id },
            include: {
                Task: { orderBy: { orderIndex: 'asc' } },
                createdBy: { select: { name: true, email: true } }
            },
        });

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }
        res.json(program);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving program' });
    }
};

// @desc    Create a program
// @route   POST /api/programs
// @access  Private/Admin
const createProgram = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, domain, durationDays, startDate, endDate } = req.body;

    try {
        const program = await prisma.program.create({
            data: {
                title,
                description,
                domain,
                durationDays: parseInt(durationDays, 10),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                createdById: req.user.id,
            },
        });

        res.status(201).json(program);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating program' });
    }
};

// @desc    Update a program
// @route   PUT /api/programs/:id
// @access  Private/Admin
const updateProgram = async (req, res) => {
    try {
        let program = await prisma.program.findUnique({ where: { id: req.params.id } });

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        const { title, description, domain, durationDays, startDate, endDate } = req.body;

        program = await prisma.program.update({
            where: { id: req.params.id },
            data: {
                title: title || program.title,
                description: description || program.description,
                domain: domain || program.domain,
                durationDays: durationDays ? parseInt(durationDays, 10) : program.durationDays,
                startDate: startDate ? new Date(startDate) : program.startDate,
                endDate: endDate ? new Date(endDate) : program.endDate,
            },
        });

        res.json(program);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating program' });
    }
};

// @desc    Delete a program
// @route   DELETE /api/programs/:id
// @access  Private/Admin
const deleteProgram = async (req, res) => {
    try {
        const program = await prisma.program.findUnique({ where: { id: req.params.id } });

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        await prisma.program.delete({ where: { id: req.params.id } });

        res.json({ message: 'Program removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting program (checks if there are connected enrollments/tasks)' });
    }
};

module.exports = {
    getPrograms,
    getProgramById,
    createProgram,
    updateProgram,
    deleteProgram,
};
