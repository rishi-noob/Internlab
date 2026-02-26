const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
    const email = 'admin@internlab.com';
    const password = 'admin123';
    const name = 'Admin';

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.upsert({
            where: { email },
            update: {
                name,
                role: 'ADMIN',
                password: hashedPassword,
            },
            create: {
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        console.log(`✅ Admin account ensured: ${email} / ${password}`);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
