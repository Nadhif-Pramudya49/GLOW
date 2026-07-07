const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('Seeding Demo Scenario...');

  // 1. Create User (Customer)
  const userPassword = await bcrypt.hash('password123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'user_demo@glow.com' },
    update: {},
    create: {
      fullName: 'Budi Santoso',
      email: 'user_demo@glow.com',
      password: userPassword,
      role: 'USER',
    }
  });

  // 2. Create Owner (Mitra)
  const ownerPassword = await bcrypt.hash('password123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'juragan@glow.com' },
    update: {},
    create: {
      fullName: 'Juragan Wisata',
      email: 'juragan@glow.com',
      password: ownerPassword,
      role: 'OWNER',
    }
  });

  const business = await prisma.businessProfile.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      businessName: 'Pesona Alam Corp',
      status: 'VERIFIED'
    }
  });

  // 3. Create Locations for the Owner
  const location1 = await prisma.location.create({
    data: {
      businessId: business.id,
      name: 'Pantai Indrayanti Premium Area',
      category: 'Wisata',
      address: 'Gunung Kidul, Yogyakarta',
      latitude: -8.1495,
      longitude: 110.6121,
      wifiSpeed: 20,
      hasPowerOutlet: true,
      facilities: ['Gazebo', 'Colokan Listrik', 'Kipas Angin'],
      suasana: ['Angin Sepoi', 'Suara Ombak'],
      description: 'Area khusus bekerja sambil menikmati pantai Indrayanti dengan WiFi khusus.',
      img: '/uploads/beach_coworking_1783159882521.png',
      isPublished: true,
      packages: {
        create: [
          { packageName: 'Daily Pass', pricePerDay: 50000 },
          { packageName: 'Weekly Pass', pricePerDay: 300000 }
        ]
      }
    },
    include: { packages: true }
  });

  const location2 = await prisma.location.create({
    data: {
      businessId: business.id,
      name: 'Puncak Tebing Breksi Co-work',
      category: 'Wisata',
      address: 'Prambanan, Sleman',
      latitude: -7.7818,
      longitude: 110.0076,
      wifiSpeed: 30,
      hasPowerOutlet: true,
      facilities: ['Ruang Kaca', 'AC', 'Kafe'],
      suasana: ['Tenang', 'Pemandangan Kota'],
      description: 'Bekerja dari ketinggian dengan pemandangan kota Yogyakarta.',
      img: '/uploads/luxurious_cabin_1783159864494.png',
      isPublished: true,
      packages: {
        create: [
          { packageName: 'Half Day', pricePerDay: 35000 },
          { packageName: 'Full Day', pricePerDay: 70000 }
        ]
      }
    },
    include: { packages: true }
  });

  // 4. Create Bookings (Simulate customer ordering)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  // Booking 1: PENDING (New Order, Needs Confirmation)
  const booking1 = await prisma.booking.create({
    data: {
      userId: customer.id,
      packageId: location1.packages[0].id,
      startDate: today,
      endDate: today,
      totalPrice: 50000,
      status: 'PENDING'
    }
  });

  // Booking 2: CONFIRMED (Already Paid, Waiting for Customer to Finish)
  const booking2 = await prisma.booking.create({
    data: {
      userId: customer.id,
      packageId: location2.packages[1].id,
      startDate: today,
      endDate: nextWeek,
      totalPrice: 490000, // 7 days * 70000
      status: 'CONFIRMED'
    }
  });

  // Booking 3: COMPLETED (Finished, Has Review)
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 10);
  
  const booking3 = await prisma.booking.create({
    data: {
      userId: customer.id,
      packageId: location1.packages[1].id,
      startDate: pastDate,
      endDate: pastDate,
      totalPrice: 300000,
      status: 'COMPLETED'
    }
  });

  await prisma.review.create({
    data: {
      bookingId: booking3.id,
      rating: 5,
      wifiRating: 4.5,
      workspaceRating: 5.0,
      ambienceRating: 4.8,
      comment: 'Tempatnya sangat asik buat kerja! WiFi lumayan stabil meski di pinggir pantai. Bakal balik lagi minggu depan.'
    }
  });

  console.log('✅ Demo Scenario created successfully!');
  console.log('Login as Owner: juragan@glow.com / password123');
  console.log('Login as User: user_demo@glow.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
