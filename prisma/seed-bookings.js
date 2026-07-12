const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBookings() {
  console.log("Seeding dummy bookings...");

  // Find user
  const budi = await prisma.user.findFirst({ where: { email: 'budi@example.com' } });
  
  // Find packages
  const packages = await prisma.package.findMany({
    include: { location: true },
    take: 10
  });

  if (!budi || packages.length === 0) {
    console.error("Missing user or packages to seed.");
    return;
  }

  const statuses = ['COMPLETED', 'CONFIRMED', 'PENDING', 'CANCELLED'];
  const today = new Date();

  for (let i = 0; i < 20; i++) {
    const pkg = packages[i % packages.length];
    const status = statuses[i % statuses.length];
    
    // Create random start date between -15 days and +15 days
    let startDate = new Date();
    startDate.setDate(today.getDate() + (i - 10));
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (i % 3) + 1); // 1-3 days duration

    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const guestCount = (i % 4) + 1;
    const pricePerDay = Number(pkg.pricePerDay) || 100000;
    const totalPrice = pricePerDay * duration * guestCount;

    const booking = await prisma.booking.create({
      data: {
        userId: budi.id,
        packageId: pkg.id,
        startDate,
        endDate,
        guestCount,
        totalPrice,
        status,
        itineraries: {
          create: [
            {
              dayNumber: 1,
              activityName: 'Deep Work Session di ' + pkg.location.name,
              timeSlot: new Date(startDate.setHours(9, 0, 0, 0)),
              isProductivity: true
            },
            {
              dayNumber: 1,
              activityName: 'Istirahat & Menikmati Suasana',
              timeSlot: new Date(startDate.setHours(12, 0, 0, 0)),
              isProductivity: false
            },
            {
              dayNumber: 1,
              activityName: 'Meeting Online (Zoom)',
              timeSlot: new Date(startDate.setHours(14, 0, 0, 0)),
              isProductivity: true
            }
          ]
        },
        experienceLogs: {
          create: [
            {
              moodScore: 4 + (i % 2),
              note: 'Kerja di sini sangat fokus, angin laut sejuk bikin pikiran segar.',
              loggedAt: new Date(startDate.setHours(17, 0, 0, 0))
            }
          ]
        }
      }
    });

    // Add review for COMPLETED bookings
    if (status === 'COMPLETED') {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          rating: 4 + (i % 2),
          wifiRating: 4,
          workspaceRating: 5,
          ambienceRating: 5,
          comment: 'Tempat workation yang sangat direkomendasikan! Internet stabil dan suasana kondusif.'
        }
      });
    }
  }

  console.log("Seeding bookings finished successfully! 🎉");
}

seedBookings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
