const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get saved packages for user
exports.getSavedPackages = async (req, res) => {
  try {
    const savedPackages = await prisma.savedPackage.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    // Parse JSON
    const data = savedPackages.map(pkg => ({
      ...pkg,
      packageData: typeof pkg.packageData === 'string' ? JSON.parse(pkg.packageData) : pkg.packageData
    }));
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch saved packages' });
  }
};

// Save a new package draft
exports.savePackage = async (req, res) => {
  try {
    const { name, packageData } = req.body;
    if (!name || !packageData) {
      return res.status(400).json({ error: 'Name and packageData are required' });
    }

    const savedPackage = await prisma.savedPackage.create({
      data: {
        userId: req.user.id,
        name,
        packageData
      }
    });
    res.status(201).json(savedPackage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save package' });
  }
};

// Delete a saved package draft
exports.deleteSavedPackage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure ownership
    const existing = await prisma.savedPackage.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Package not found or unauthorized' });
    }

    await prisma.savedPackage.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Package deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete package' });
  }
};
