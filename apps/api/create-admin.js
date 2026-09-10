const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

const allowedDevelopmentHosts = new Set(['postgres', 'localhost', '127.0.0.1']);
const developmentDatabase = 'clinic_db';

function readRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing ${name}. Set it in the development API container before running the seed script.`);
    }
    return value;
}

function assertSafeDevelopmentEnvironment() {
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('Development user seeding is disabled outside NODE_ENV=development.');
    }
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required. Run this command inside the development API container.');
    }

    const url = new URL(process.env.DATABASE_URL);
    if (!allowedDevelopmentHosts.has(url.hostname) || url.pathname.replace(/^\//, '') !== developmentDatabase) {
        throw new Error('Refusing to seed a non-development database. Run this command inside the development API container or against the local dev database.');
    }
}

async function ensureUser({ email, password, name, role }) {
    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash, name, role, isActive: true },
        create: {
            email,
            passwordHash,
            name,
            role,
            isActive: true,
        },
    });

    console.log(`Development ${role.toLowerCase()} user is ready: ${user.email}`);
    return user;
}

async function main() {
    assertSafeDevelopmentEnvironment();

    const adminEmail = readRequiredEnv('DEV_ADMIN_EMAIL');
    const adminPassword = readRequiredEnv('DEV_ADMIN_PASSWORD');
    const receptionistEmail = readRequiredEnv('DEV_RECEPTIONIST_EMAIL');
    const receptionistPassword = readRequiredEnv('DEV_RECEPTIONIST_PASSWORD');

    await ensureUser({
        email: adminEmail,
        password: adminPassword,
        name: 'Admin',
        role: 'ADMIN',
    });

    await ensureUser({
        email: receptionistEmail,
        password: receptionistPassword,
        name: 'Receptionist',
        role: 'RECEPTIONIST',
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
