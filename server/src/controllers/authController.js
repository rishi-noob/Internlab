const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../config/auth');

// @desc    Register a new user (with or without invite code)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, inviteToken, phone, college, duration, interests } = req.body;

    try {
        // Check if user exists
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // SECURITY: Public registration always creates INTERN accounts.
        // Admin/Mentor accounts must be created by an existing admin.
        const finalRole = 'INTERN';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: finalRole,
                phone: phone || null,
                college: college || null,
                duration: duration ? parseInt(duration) : null,
                interests: interests || null,
            },
        });

        let enrolledProgramId = null;

        // Handle invite code if provided (short code lookup)
        if (inviteToken && finalRole === 'INTERN') {
            try {
                const invite = await prisma.inviteCode.findUnique({ where: { code: inviteToken.trim().toUpperCase() } });

                if (invite && !invite.used && new Date() < new Date(invite.expiresAt)) {
                    const program = await prisma.program.findUnique({ where: { id: invite.programId } });

                    if (program) {
                        const enrolledAt = new Date();
                        const expiresAt = new Date();
                        expiresAt.setDate(expiresAt.getDate() + program.durationDays);

                        await prisma.enrollment.create({
                            data: {
                                userId: user.id,
                                programId: program.id,
                                status: 'ACTIVE',
                                enrolledAt,
                                expiresAt,
                            },
                        });
                        enrolledProgramId = program.id;
                    }
                }
            } catch (err) {
                console.warn('Invalid invite code provided during registration', err.message);
            }
        }

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            college: user.college,
            duration: user.duration,
            interests: user.interests,
            token: generateToken(user.id, user.role),
            enrolledProgramId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Find user
        const user = await prisma.user.findUnique({ where: { email } });

        // Validate password
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                college: user.college,
                duration: user.duration,
                interests: user.interests,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get user profile data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// Helper: generate a short alphanumeric code
function generateShortCode(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I,O,0,1
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// @desc    Generate a short invite code for a specific program
// @route   POST /api/auth/invite
// @access  Private/Admin
const generateInviteToken = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { programId } = req.body;

    try {
        // Verify program exists
        const program = await prisma.program.findUnique({ where: { id: programId } });

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Generate unique short code
        let code;
        let exists = true;
        while (exists) {
            code = generateShortCode(6);
            const found = await prisma.inviteCode.findUnique({ where: { code } });
            exists = !!found;
        }

        // Expires in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await prisma.inviteCode.create({
            data: {
                code,
                programId: program.id,
                createdById: req.user.id,
                expiresAt,
            }
        });

        res.status(200).json({
            message: 'Invite code generated successfully',
            inviteToken: invite.code,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error generating invite code' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    generateInviteToken,
};
