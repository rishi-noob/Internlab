const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token and exclude password
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phone: true,
                    college: true,
                    duration: true,
                    interests: true,
                },
            });

            if (!req.user) {
                return res.status(401).json({ message: 'User not found, Not authorized' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Token failed, Not authorized' });
        }
    } else {
        return res.status(401).json({ message: 'No token provided, Not authorized' });
    }
};

// Middleware to check user role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role (${req.user ? req.user.role : 'None'}) is not allowed to access this resource`,
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
