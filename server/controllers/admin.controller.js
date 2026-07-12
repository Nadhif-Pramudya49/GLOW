const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getBusinesses = async (req, res) => {
  try {
    const { status } = req.query; // ?status=PENDING
    
    const where = {};
    if (status) {
      where.status = status;
    }

    const businesses = await prisma.businessProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    res.json({ businesses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
};

exports.updateBusinessStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const business = await prisma.businessProfile.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({ business });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update business status' });
  }
};

// --- STATS ---
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const totalOwners = await prisma.user.count({ where: { role: 'OWNER' } });
    const totalLocations = await prisma.location.count();
    const totalBookings = await prisma.booking.count();
    
    // Revenue is sum of totalPrice where status is COMPLETED or CONFIRMED
    const revenueResult = await prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: ['COMPLETED', 'CONFIRMED'] } }
    });

    const allBookings = await prisma.booking.findMany({
      select: { startDate: true, status: true, totalPrice: true }
    });

    let monthlyRevenue = new Array(12).fill(0);
    let bookingsByStatus = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    
    const currentYear = new Date().getFullYear();

    allBookings.forEach(b => {
      if (bookingsByStatus[b.status] !== undefined) {
        bookingsByStatus[b.status]++;
      }
      if (b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
        const d = new Date(b.startDate);
        if (d.getFullYear() === currentYear) {
          monthlyRevenue[d.getMonth()] += Number(b.totalPrice) || 0;
        }
      }
    });

    res.json({
      stats: {
        totalUsers,
        totalOwners,
        totalLocations,
        totalBookings,
        revenue: revenueResult._sum.totalPrice || 0,
        monthlyRevenue,
        bookingsByStatus
      }
    });
  } catch(error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

// --- USERS ---
exports.getUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const where = {};
    if (q) {
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } }
      ];
    }
    const users = await prisma.user.findMany({
      where,
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
      orderBy: { id: 'desc' }
    });
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['USER', 'OWNER'].includes(role)) return res.status(400).json({ error: 'Hanya bisa mengubah role ke USER atau OWNER' });
    
    // Cegah mengubah role milik ADMIN
    const targetUser = await prisma.user.findUnique({ where: { id: parseInt(id) }});
    if (targetUser && targetUser.role === 'ADMIN') {
      return res.status(403).json({ error: 'Role ADMIN tidak dapat diubah' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: { id: true, fullName: true, email: true, role: true }
    });

    if (role === 'OWNER') {
      await prisma.businessProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          businessName: user.fullName + ' Business',
          status: 'PENDING'
        }
      });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    
    // Cegah menghapus ADMIN
    const targetUser = await prisma.user.findUnique({ where: { id: parseInt(id) }});
    if (targetUser && targetUser.role === 'ADMIN') {
      return res.status(403).json({ error: 'Akun ADMIN tidak boleh dihapus' });
    }
    
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        userProfile: true,
        businessProfile: {
          include: {
            locations: {
              include: {
                packages: {
                  include: {
                    bookings: true
                  }
                }
              }
            }
          }
        },
        bookings: {
          include: {
            package: {
              include: { location: true }
            }
          },
          orderBy: { id: 'desc' }
        },
        savedPackages: {
          orderBy: { createdAt: 'desc' }
        },
        favorites: {
          include: {
            location: { select: { name: true, img: true } }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Calculate owner stats if user is an OWNER
    let ownerStats = null;
    if (user.role === 'OWNER' && user.businessProfile) {
      let totalBookings = 0;
      let totalRevenue = 0;
      let monthlyRevenue = new Array(12).fill(0);
      let locationStats = [];

      const currentYear = new Date().getFullYear();

      user.businessProfile.locations.forEach(loc => {
        let locBookings = 0;
        let locRevenue = 0;
        
        loc.packages.forEach(pkg => {
          pkg.bookings.forEach(b => {
            if (b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
              totalBookings++;
              locBookings++;
              const price = Number(b.totalPrice) || 0;
              totalRevenue += price;
              locRevenue += price;

              const bDate = new Date(b.startDate);
              if (bDate.getFullYear() === currentYear) {
                monthlyRevenue[bDate.getMonth()] += price;
              }
            }
          });
        });

        locationStats.push({
          id: loc.id,
          name: loc.name,
          category: loc.category,
          bookingsCount: locBookings,
          revenue: locRevenue
        });
      });

      ownerStats = {
        totalLocations: user.businessProfile.locations.length,
        totalBookings,
        totalRevenue,
        monthlyRevenue,
        locationStats: locationStats.sort((a,b) => b.revenue - a.revenue)
      };
      
      // Clean up the deep nested data to save payload size
      delete user.businessProfile.locations;
    }

    // Remove password from response
    const { password, ...safeUser } = user;
    res.json({ user: safeUser, ownerStats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

// --- LOCATIONS ---
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        business: {
          include: { user: { select: { fullName: true, email: true } } }
        },
        packages: { select: { id: true } }
      },
      orderBy: { id: 'desc' }
    });
    res.json({ locations });
  } catch(error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

exports.toggleLocationPublish = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await prisma.location.findUnique({ where: { id: parseInt(id) } });
    if (!location) return res.status(404).json({ error: 'Location not found' });
    
    const updated = await prisma.location.update({
      where: { id: parseInt(id) },
      data: { isPublished: !location.isPublished }
    });
    res.json({ location: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle location status' });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
};