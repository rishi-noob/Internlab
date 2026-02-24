const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
    const email = 'admin@internlab.com';
    const password = 'admin123';
    const name = 'Admin';

    try {
        // Check if admin already exists
        const existing = await prisma.user.findUnique({ where: { email } });

        if (existing) {
            // Update role to ADMIN if not already
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' },
            });
            console.log(`✅ User "${email}" updated to ADMIN role.`);
        } else {
            // Create new admin
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'ADMIN',
                },
            });
            console.log(`✅ Admin account created: ${email} / ${password}`);
        }
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
