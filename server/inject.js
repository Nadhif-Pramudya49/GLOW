const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'budi@example.com' } });
  if (!user) { console.log('Budi not found'); return; }
  console.log('Found user:', user.email, 'ID:', user.id);
  
  const pkg = await prisma.package.findFirst();
  
  if (pkg) {
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        packageId: pkg.id,
        status: 'COMPLETED',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-05'),
        guestCount: 2,
        totalPrice: 1500000
      }
    });
    console.log('Injected booking:', booking.id);
  } else {
    console.log('No package found');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
