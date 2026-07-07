const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@glow.com' },
    update: {
      role: 'ADMIN',
      password: adminPassword
    },
    create: {
      fullName: 'Administrator',
      email: 'admin@glow.com',
      password: adminPassword,
      role: 'ADMIN',
    }
  });
  console.log('Admin user seeded.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
