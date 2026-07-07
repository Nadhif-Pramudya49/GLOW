const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Start seeding...');
  
  // Read and parse data.js
  const dataPath = path.join(__dirname, '../client/js/data.js');
  let dataContent = fs.readFileSync(dataPath, 'utf8');
  
  // Extract DATA object
  const dataMatch = dataContent.match(/const\s+DATA\s*=\s*(\{[\s\S]*?\});/);
  if (!dataMatch) {
    throw new Error('Could not find DATA in data.js');
  }
  
  // Using eval to parse the JS object string (safe here since it's our own file)
  let DATA;
  eval(`DATA = ${dataMatch[1]}`);
  
  // 1. Create a dummy OWNER
  const hashedPassword = await bcrypt.hash('password123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@glow.com' },
    update: {},
    create: {
      fullName: 'Dummy Owner',
      email: 'owner@glow.com',
      password: hashedPassword,
      role: 'OWNER',
    }
  });

  const business = await prisma.businessProfile.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      businessName: 'Glow Dummy Corp',
      status: 'VERIFIED'
    }
  });

  // 2. Insert dummy locations
  const allData = [...DATA.penginapan, ...DATA.workspace, ...DATA.wisata, ...DATA.kuliner];
  
  for (const item of allData) {
    await prisma.location.create({
      data: {
        businessId: business.id,
        isPublished: true,
        name: item.name,
        category: item.category,
        address: 'Gunung Kidul, Yogyakarta',
        latitude: item.lat,
        longitude: item.lng,
        wifiSpeed: item.wifi,
        hasPowerOutlet: item.facilities.includes('Colokan'),
        description: item.desc,
        img: item.img,
        rating: item.rating,
        reviews: item.reviews,
        facilities: item.facilities,
        suasana: item.suasana
      }
    });
  }

  // Also create a dummy predefined Package for backward compatibility testing
  const firstLocation = await prisma.location.findFirst();
  if (firstLocation) {
    await prisma.package.create({
      data: {
        locationId: firstLocation.id,
        packageName: 'Paket Promo Akhir Tahun',
        pricePerDay: 500000,
      }
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
