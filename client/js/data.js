// ===== DATA DUMMY GLOW APP =====
// DATA Locations have been migrated to MySQL Database.
const DATA = null;


const TRANSPORT_OPTIONS = [
  { 
    id:'motor', name:'Sewa Motor', price:75000, img:'assets/images/trans-motor.png',
    openingHours: 'Setiap Hari, 06:00 - 22:00',
    seats: '2 Penumpang', fuel: 'Bensin (Pertalite/Pertamax)',
    agents: ['Bintang Rental', 'Gunung Kidul MotoRent'],
    terms: ['Wajib menitipkan E-KTP asli.', 'Menunjukkan SIM C yang masih berlaku.', 'Harga di luar BBM.', 'Keterlambatan pengembalian dikenakan denda Rp 10.000/jam.']
  },
  { 
    id:'mobil', name:'Sewa Mobil', price:350000, img:'assets/images/trans-mobil.png',
    openingHours: 'Setiap Hari, 05:00 - 23:00',
    seats: '5-7 Penumpang', fuel: 'Bensin (Pertalite/Pertamax)',
    agents: ['Glow Trans', 'Jogja Maju Lancar'],
    terms: ['Bisa sewa lepas kunci (syarat ketat) atau dengan supir.', 'Harga sewa 12 jam (belum termasuk BBM dan parkir).', 'Overtime dikenakan denda Rp 35.000/jam.', 'Wajib survei hotel/penginapan.']
  },
  { 
    id:'ojek', name:'Ojek Online', price:0, img:'assets/images/trans-ojol.png', note:'Per perjalanan',
    openingHours: '24 Jam',
    seats: '1 Penumpang', fuel: '-',
    agents: ['Gojek', 'Grab', 'Maxim'],
    terms: ['Tergantung ketersediaan *driver* di area tujuan.', 'Harga fluktuatif sesuai jam sibuk.', 'Pembayaran langsung melalui aplikasi pihak ketiga.']
  },
  { 
    id:'kereta', name:'Kereta Api (KAI)', price:150000, img:'assets/images/trans-kereta.png',
    openingHours: 'Sesuai Jadwal', seats: '1 Kursi / Tiket', fuel: '-',
    agents: ['PT. KAI'], terms: ['Pemesanan H-7 direkomendasikan.', 'Harga bergantung pada kelas dan rute.']
  },
  {
    id:'bus', name:'Bus Antar Kota', price:180000, img:'assets/images/trans-bus.png',
    openingHours: 'Sesuai Jadwal', seats: '1 Kursi / Tiket', fuel: '-',
    agents: ['Rosalia Indah', 'Sinar Jaya'], terms: ['Tersedia kelas VIP & Executive.', 'Termasuk servis makan.']
  },
  {
    id:'becak', name:'Becak Tradisional', price:30000, img:'assets/images/trans-becak.png',
    openingHours: 'Pagi - Sore', seats: '2 Penumpang', fuel: 'Tenaga Manusia',
    agents: ['Paguyuban Becak'], terms: ['Cocok untuk jarak dekat santai.', 'Harga bisa ditawar.']
  },
  {
    id:'bajai', name:'Bajai / Bemo', price:25000, img:'assets/images/trans-bajai.png',
    openingHours: 'Fleksibel', seats: '2 Penumpang', fuel: 'Bensin',
    agents: ['Driver Lokal'], terms: ['Angkutan jarak dekat.', 'Sensasi berkendara yang unik.']
  },
  {
    id:'odong', name:'Odong-Odong Wisata', price:10000, img:'assets/images/trans-odong.png',
    openingHours: '08:00 - 17:00', seats: 'Terbuka', fuel: '-',
    agents: ['Komunitas Wisata'], terms: ['Beroperasi di sekitar tempat wisata.', 'Digemari anak-anak.']
  },
  {
    id:'delman', name:'Delman / Andong', price:50000, img:'assets/images/trans-delman.png',
    openingHours: '08:00 - 18:00', seats: '4 Penumpang', fuel: 'Tenaga Kuda',
    agents: ['Paguyuban Andong'], terms: ['Wisata keliling kota / alun-alun.', 'Harga untuk 1 putaran rute.']
  }
];

// Reviews are fetched from DB
