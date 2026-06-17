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

module.exports = { getAllLocations, getLocationById };
