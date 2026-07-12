const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const u = await prisma.user.findMany();
  console.log(JSON.stringify(u, null, 2));
}
check().finally(() => prisma.$disconnect());
