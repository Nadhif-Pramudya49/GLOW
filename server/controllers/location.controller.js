const prisma = require('../config/database');

const getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: { packages: true }
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getLocationById = async (req, res) => {
  const { id } = req.params;
  try {
    const location = await prisma.location.findUnique({
      where: { id: parseInt(id) },
      include: { packages: true }
    });

    if (!location) {
      return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
    }

    res.json(location);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getGoogleReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const location = await prisma.location.findUnique({
      where: { id: parseInt(id) }
    });

    if (!location) {
      return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'KODE_API_ANDA') {
      const dummyReviews = [
        {
          author_name: "Budi Santoso",
          rating: 5,
          relative_time_description: "3 minggu lalu",
          text: `Pengalaman yang luar biasa di ${location.name}. Tempatnya sangat indah dan sesuai dengan ekspektasi. Pasti akan kembali lagi ke sini!`,
          profile_photo_url: "https://ui-avatars.com/api/?name=Budi+Santoso&background=random"
        },
        {
          author_name: "Siti Rahmawati",
          rating: 4,
          relative_time_description: "1 bulan lalu",
          text: `Akses menuju ${location.name} lumayan menantang, tapi terbayar dengan pemandangannya yang memukau. Sangat direkomendasikan untuk healing.`,
          profile_photo_url: "https://ui-avatars.com/api/?name=Siti+Rahmawati&background=random"
        },
        {
          author_name: "Andi Pratama",
          rating: 5,
          relative_time_description: "2 bulan lalu",
          text: "Spot terbaik di Gunung Kidul sejauh ini. Fasilitas cukup lengkap dan kebersihannya sangat terjaga.",
          profile_photo_url: "https://ui-avatars.com/api/?name=Andi+Pratama&background=random"
        }
      ];
      return res.json({ status: "OK", result: { reviews: dummyReviews }, mock: true });
    }

    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(location.name + ' Gunung Kidul')}&location=${location.latitude},${location.longitude}&radius=5000&key=${apiKey}`;
    const searchRes = await fetch(searchUrl).then(r => r.json());
    
    if (!searchRes.results || searchRes.results.length === 0) {
      return res.json({ status: "ZERO_RESULTS", result: { reviews: [] } });
    }

    const placeId = searchRes.results[0].place_id;
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=id&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl).then(r => r.json());

    res.json(detailsRes);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllLocations, getLocationById, getGoogleReviews };
