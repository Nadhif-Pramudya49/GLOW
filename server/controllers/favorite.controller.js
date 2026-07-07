const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { location: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { locationId } = req.body;
    if (!locationId) return res.status(400).json({ error: 'locationId is required' });

    const fav = await prisma.favorite.upsert({
      where: {
        userId_locationId: { userId: req.user.id, locationId: parseInt(locationId) }
      },
      update: {},
      create: {
        userId: req.user.id,
        locationId: parseInt(locationId)
      }
    });
    res.status(201).json(fav);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { locationId } = req.params;
    await prisma.favorite.delete({
      where: {
        userId_locationId: { userId: req.user.id, locationId: parseInt(locationId) }
      }
    });
    res.json({ message: 'Favorite removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
};
