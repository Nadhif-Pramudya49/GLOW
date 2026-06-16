const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // 1. Clean up existing data
  await prisma.review.deleteMany();
  await prisma.experienceLog.deleteMany();
  await prisma.itinerary.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.package.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      fullName: 'Budi Nomad',
      email: 'budi@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  });

  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin GLOW',
      email: 'admin@glow.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // 3. Create Locations
  const loc1 = await prisma.location.create({
    data: {
      name: 'Segara Cafe & Stay',
      category: 'Beachfront',
      address: 'Pantai Indrayanti, Gunung Kidul',
      latitude: -8.1504,
      longitude: 110.6124,
      wifiSpeed: 50,
      description: 'Nikmati bekerja dengan suara ombak dan fasilitas lengkap.',
      packages: {
        create: [
          { packageName: 'Sunset Worker', pricePerDay: 50000 },
          { packageName: 'Weekend Staycation', pricePerDay: 450000 },
        ],
      },
    },
  });

  const loc2 = await prisma.location.create({
    data: {
      name: 'HeHa Ocean View Work Hub',
      category: 'Cliffside',
      address: 'Bolang, Girikarto, Gunung Kidul',
      latitude: -8.1147,
      longitude: 110.4851,
      wifiSpeed: 30,
      description: 'Pemandangan tebing dan laut lepas untuk inspirasi tanpa batas.',
      packages: {
        create: [
          { packageName: 'Full Day Nomad', pricePerDay: 75000 },
        ],
      },
    },
  });

  const loc3 = await prisma.location.create({
    data: {
      name: 'Puncak Segoro Digital Nomad Corner',
      category: 'Hill',
      address: 'Wiloso, Girikarto, Gunung Kidul',
      latitude: -8.1200,
      longitude: 110.4900,
      wifiSpeed: 40,
      description: 'Suasana tenang di atas bukit dengan meja ergonomis.',
      packages: {
        create: [
          { packageName: 'Deep Work Session', pricePerDay: 60000 },
        ],
      },
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
