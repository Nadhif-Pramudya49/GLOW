const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const locs = await prisma.location.findMany({
    select: { id: true, name: true, img: true }
  });
  console.log(locs.slice(0, 10));
}
main().catch(console.error).finally(() => prisma.$disconnect());
