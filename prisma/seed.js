const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const DATA = {
  penginapan: [
    { name:'Villa Pantai Indrayanti', price:850000, category:'Penginapan', rating:4.8, reviews:124, wifi:50, facilities:['AC','Kolam Renang','Parkir'], suasana:['Pemandangan laut'], lat:-8.149768841125777, lng:110.6135916693358, img:'assets/images/p1-villa-indrayanti.png', desc:'Villa mewah dengan pemandangan langsung ke Pantai Indrayanti. Nikmati deburan ombak dari kamar tidur Anda. Fasilitas lengkap untuk workation nyaman.' },
    { name:'Omah Bambu Gunung Kidul', price:350000, category:'Penginapan', rating:4.6, reviews:89, wifi:20, facilities:['AC','Parkir'], suasana:['Tenang','Alam'], lat:-8.147600146819713, lng:110.61383522982246, img:'assets/images/p2-omah-bambu.png', desc:'Penginapan unik berbahan bambu di tengah alam hijau. Suasana tenang jauh dari keramaian, cocok untuk deep work.' },
    { name:'Homestay Tepus Asri', price:200000, category:'Penginapan', rating:4.3, reviews:67, wifi:10, facilities:['Parkir'], suasana:['Lokal','Autentik'], lat:-8.17, lng:110.61, img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', desc:'Homestay sederhana namun nyaman dengan nuansa lokal Gunung Kidul yang autentik. Harga terjangkau, cocok untuk budget traveler.' },
    { name:'Bintang Selatan Resort', price:1200000, category:'Penginapan', rating:4.9, reviews:203, wifi:100, facilities:['AC','Kolam Renang','Spa','Parkir'], suasana:['Premium'], lat:-8.14, lng:110.63, img:'assets/images/p4-bintang-selatan.png', desc:'Resort bintang lima di tepi pantai selatan. Layanan premium, fasilitas spa, dan koneksi internet ultra-cepat 100 Mbps.' },
    { name:'Karang Agung Guesthouse', price:280000, category:'Penginapan', rating:4.4, reviews:45, wifi:15, facilities:['AC'], suasana:['Tenang'], lat:-8.16, lng:110.60, img:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', desc:'Guesthouse bersih dan nyaman dengan AC. Cocok untuk solo workationer yang butuh ketenangan.' },
    { name:'Pondok Joglo Heritage', price:450000, category:'Penginapan', rating:4.7, reviews:78, wifi:30, facilities:['AC','Parkir'], suasana:['Budaya Jawa'], lat:-8.155, lng:110.59, img:'assets/images/p6-joglo-heritage.png', desc:'Penginapan bergaya Joglo tradisional dengan sentuhan modern. Rasakan harmoni budaya Jawa di tengah alam Gunung Kidul.' },
    { name:'Luxury Ocean Cabin', price:2100000, category:'Penginapan', rating:5.0, reviews:45, wifi:100, facilities:['AC','Infinity Pool','Spa','Private Beach'], suasana:['Premium','Eksklusif'], lat:-8.140, lng:110.600, img:'assets/images/p7-luxury-cabin.png', desc:'Kabin kayu mewah dengan desain arsitektur modern dan pemandangan laut luas. Dilengkapi kolam renang infinity pribadi untuk inspirasi maksimal.' },
  ],
  workspace: [
    { name:'Segara Cafe & Cowork', price:50000, category:'Workspace', rating:4.9, reviews:312, wifi:100, facilities:['Colokan','AC','Parkir'], suasana:['Pemandangan laut','Outdoor'], lat:-8.147, lng:110.621, img:'assets/images/w1-segara-cafe.png', desc:'Cafe coworking space terbaik di Gunung Kidul dengan pemandangan laut langsung. WiFi 100 Mbps, banyak colokan, AC dingin.' },
    { name:'Kopi Kidul Workspace', price:30000, category:'Workspace', rating:4.5, reviews:187, wifi:50, facilities:['Colokan','AC'], suasana:['Tenang','Indoor'], lat:-7.968318880605496, lng:110.61610851807038, img:'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80', desc:'Workspace dengan nuansa tenang, full AC, dan kopi pilihan Gunung Kidul. Tempat ideal untuk deep work.' },
    { name:'Obelix Sea View Cafe', price:45000, category:'Workspace', rating:4.8, reviews:256, wifi:75, facilities:['Colokan','Parkir'], suasana:['View bukit & laut'], lat:-8.025135959869427, lng:110.34691148987548, img:'assets/images/w3-obelix-cafe.png', desc:'Cafe dengan view bukit dan laut yang memukau. Tempat terbaik untuk kerja sambil menikmati pemandangan alam.' },
    { name:'Hutan Pinus Cowork', price:25000, category:'Workspace', rating:4.3, reviews:98, wifi:20, facilities:['Colokan','Parkir'], suasana:['Outdoor','Sejuk'], lat:-8.17, lng:110.585, img:'assets/images/w4-hutan-pinus.png', desc:'Coworking space outdoor di bawah pohon pinus. Udara segar dan suasana sejuk untuk meningkatkan kreativitas.' },
    { name:'Rumah Kreatif GK', price:60000, category:'Workspace', rating:4.6, reviews:134, wifi:100, facilities:['Colokan','AC','Parkir'], suasana:['Kolaboratif','Sosial'], lat:-8.158, lng:110.608, img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', desc:'Hub kreatif untuk kolaborasi. Sering ada event networking, workshop, dan komunitas digital nomad.' },
    { name:'Warung Kopi Nelayan', price:15000, category:'Workspace', rating:4.2, reviews:56, wifi:10, facilities:['Colokan'], suasana:['Lokal','Tepi pantai'], lat:-8.15, lng:110.625, img:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', desc:'Warung kopi sederhana tepi pantai dengan vibe lokal yang kuat. Murah meriah, cocok untuk yang butuh inspirasi.' },
    { name:'The Horizon Coworking', price:85000, category:'Workspace', rating:4.9, reviews:89, wifi:150, facilities:['Colokan','AC','Ruang Meeting'], suasana:['Inspiratif','Modern'], lat:-8.142, lng:110.605, img:'assets/images/w7-beach-coworking.png', desc:'Coworking space modern super nyaman di pinggir pantai. Kaca besar menghadap lautan luas, kopi artisan, dan koneksi internet 150 Mbps.' },
  ],
  wisata: [
    { name:'Pantai Indrayanti', price:0, category:'Wisata', rating:4.8, reviews:2100, wifi:0, facilities:['Parkir'], suasana:['Pantai','Wisata'], lat:-8.1502, lng:110.6120, img:'assets/images/t1-pantai-indrayanti.png', desc:'Pantai dengan pasir putih bersih dan air biru jernih. Jarak 2 km dari pusat kota, mudah diakses.' },
    { name:'Goa Jomblang', price:450000, category:'Wisata', rating:4.9, reviews:876, wifi:0, facilities:['Parkir','Guide'], suasana:['Petualangan'], lat:-8.028682, lng:110.638410, img:'assets/images/t2-goa-jomblang.png', desc:'Gua vertikal dengan fenomena "cahaya surga" yang menakjubkan. Pengalaman turun abseil ke dalam gua purba.' },
    { name:'Pantai Nglambor', price:20000, category:'Wisata', rating:4.7, reviews:654, wifi:0, facilities:['Parkir'], suasana:['Snorkeling','Pantai'], lat:-8.181682643841373, lng:110.67846705428448, img:'assets/images/t3-pantai-nglambor.png', desc:'Pantai tersembunyi dengan spot snorkeling terbaik di Gunung Kidul. Air jernih dan terumbu karang indah.' },
    { name:'Bukit Panguk Kediwung', price:10000, category:'Wisata', rating:4.6, reviews:432, wifi:0, facilities:['Parkir'], suasana:['Sunrise','Alam'], lat:-7.9445, lng:110.4262, img:'assets/images/t4-bukit-panguk.png', desc:'Spot terbaik untuk menikmati sunrise di atas lautan kabut. Pemandangan pegunungan yang memukau saat fajar.' },
    { name:'Goa Pindul', price:75000, category:'Wisata', rating:4.5, reviews:1234, wifi:0, facilities:['Parkir','Guide'], suasana:['Petualangan'], lat:-7.930615654774818, lng:110.64964157733795, img:'assets/images/t5-goa-pindul.png', desc:'Cave tubing menyusuri sungai bawah tanah sepanjang 350 meter. Aktivitas seru untuk semua kalangan.' },
    { name:'Pantai Siung', price:10000, category:'Wisata', rating:4.7, reviews:543, wifi:0, facilities:['Parkir'], suasana:['Petualangan','Sunset'], lat:-8.181665112293318, lng:110.68321840183198, img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', desc:'Pantai dengan tebing batu karang untuk rock climbing. Sunset di sini adalah yang paling dramatis di Gunung Kidul.' },
  ],
  kuliner: [
    { name:'Warung Sate Klathak Pak Pong', price:35000, category:'Kuliner', rating:4.9, reviews:567, wifi:0, facilities:['Parkir'], suasana:['Kuliner khas','Tradisional'], lat:-8.156, lng:110.601, img:'assets/images/act-sate.png', desc:'Sate klathak legendaris khas Gunung Kidul dengan tusuk besi. Daging kambing empuk dengan bumbu rempah rahasia turun-temurun.' },
    { name:'RM Gudeg Bu Tini', price:20000, category:'Kuliner', rating:4.6, reviews:234, wifi:0, facilities:['Parkir'], suasana:['Masakan Jawa'], lat:-7.944486392844079, lng:110.2694320656141, img:'assets/images/act-gudeg.png', desc:'Gudeg autentik masakan Jawa dengan resep turun-temurun. Nangka muda dimasak perlahan dengan santan dan rempah pilihan.' },
    { name:'Ikan Bakar Pantai Baron', price:45000, category:'Kuliner', rating:4.7, reviews:389, wifi:0, facilities:['Parkir'], suasana:['Seafood','Tepi pantai'], lat:-8.127753574892967, lng:110.54926709540229, img:'assets/images/act-ikan.png', desc:'Seafood segar langsung dari nelayan lokal. Ikan dibakar dengan bumbu khas sambil menikmati pemandangan Pantai Baron.' },
    { name:'Bakmi Jawa Pak Gareng', price:18000, category:'Kuliner', rating:4.5, reviews:178, wifi:0, facilities:['Parkir'], suasana:['Tradisional','Bakmi'], lat:-8.153, lng:110.607, img:'assets/images/act-bakmi.png', desc:'Bakmi Jawa tradisional dimasak dengan tungku kayu bakar. Kuah gurih dan mie lembut yang bikin ketagihan.' },
    { name:'Kopi & Roti Gunung Kidul', price:25000, category:'Kuliner', rating:4.4, reviews:145, wifi:15, facilities:['Colokan','Parkir'], suasana:['Brunch','Kafe'], lat:-8.16, lng:110.602, img:'assets/images/act-kopi.png', desc:'Spot sarapan dan brunch favorit para remote worker. Kopi single origin Gunung Kidul dengan roti bakar artisan.' },
    { name:'Seafood Depot Drini', price:60000, category:'Kuliner', rating:4.8, reviews:312, wifi:0, facilities:['Parkir'], suasana:['Seafood','View pantai'], lat:-8.173, lng:110.612, img:'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', desc:'Depot seafood dengan view Pantai Drini yang indah. Menu lengkap mulai udang, kepiting, cumi, dan ikan segar.' },
  ],
  budaya: [
    { name:'Tari Kecak & Api', price:150000, category:'Budaya', rating:4.9, reviews:890, wifi:0, facilities:['Parkir'], suasana:['Seni','Tradisi'], lat:-8.140, lng:110.600, img:'assets/images/tarikecakapi.jpg', desc:'Pertunjukan tari tradisional memukau saat matahari terbenam.' },
    { name:'Desa Wisata Batik', price:50000, category:'Budaya', rating:4.7, reviews:320, wifi:0, facilities:['Parkir','Guide'], suasana:['Edukasi','Budaya'], lat:-8.050, lng:110.590, img:'assets/images/budaya-batik.png', desc:'Belajar membatik langsung dari para pengrajin lokal.' }
  ]
};

async function main() {
  // 1. Clean up existing data
  await prisma.review.deleteMany();
  await prisma.experienceLog.deleteMany();
  await prisma.itinerary.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.package.deleteMany();
  await prisma.location.deleteMany();
  await prisma.businessProfile.deleteMany();
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

  const owner = await prisma.user.create({
    data: {
      fullName: 'Mitra GLOW',
      email: 'owner@glow.com',
      password: hashedPassword,
      role: 'OWNER',
      businessProfile: {
        create: {
          businessName: 'PT Pariwisata GK',
          status: 'VERIFIED'
        }
      }
    },
    include: { businessProfile: true }
  });

  // 3. Create Locations
  const allItems = [...DATA.penginapan, ...DATA.workspace, ...DATA.wisata, ...DATA.kuliner, ...DATA.budaya];
  
  for (const item of allItems) {
    await prisma.location.create({
      data: {
        businessId: owner.businessProfile.id,
        isPublished: true,
        name: item.name,
        category: item.category,
        address: 'Gunung Kidul',
        latitude: item.lat,
        longitude: item.lng,
        wifiSpeed: item.wifi,
        hasPowerOutlet: (item.facilities || []).includes('Colokan'),
        description: item.desc,
        img: item.img,
        rating: item.rating,
        reviews: item.reviews,
        facilities: item.facilities,
        suasana: item.suasana,
        packages: {
          create: [
            { packageName: 'Tiket/Akses ' + item.category, pricePerDay: item.price }
          ]
        }
      }
    });
  }

  console.log('Seed data created successfully with full DUMMY DATA mapping!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
