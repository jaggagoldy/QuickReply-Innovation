import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting seed...');
        const adminPassword = await bcrypt.hash('admin123', 10);

        const admin = await prisma.user.upsert({
            where: { email: 'admin@quickreply.ai' },
            update: { role: 'SUPER_ADMIN' },
            create: {
                email: 'admin@quickreply.ai',
                name: 'Super Admin',
                password: adminPassword,
                role: 'SUPER_ADMIN',
                department: 'Management',
            },
        });

        console.log('Seed successful:', { email: admin.email, role: admin.role });
    } catch (error) {
        console.error('Seed process encountered an error:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
