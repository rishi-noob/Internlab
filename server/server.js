const app = require('./src/app');
const prisma = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Global exception handlers to prevent server crashes
process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception:', err.message);
    console.error(err.stack);
    // Don't exit — keep the server running
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit — keep the server running
});

const startServer = async () => {
    try {
        // Attempt to connect to the database
        await prisma.$connect();
        console.log('✅ Connected to database successfully.');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
