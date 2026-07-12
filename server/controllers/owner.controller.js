const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ambil lokasi milik owner yang sedang login
exports.getMyLocations = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true }
    });

    if (!user.businessProfile) {
      return res.status(404).json({ error: 'Business profile not found' });
    }

    const locations = await prisma.location.findMany({
      where: { businessId: user.businessProfile.id },
      orderBy: { id: 'desc' }
    });

    res.json({ locations, businessStatus: user.businessProfile.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

// Tambah lokasi baru (dengan dukungan multer file upload)
exports.createLocation = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true }
    });

    if (!user.businessProfile || user.businessProfile.status !== 'VERIFIED') {
      return res.status(403).json({ error: 'Business profile is not verified yet.' });
    }

    const { name, category, address, latitude, longitude, wifiSpeed, facilities, suasana, description, packages } = req.body;
    
    // Parse arrays that might be sent as stringified JSON from FormData
    let parsedFacilities = [];
    let parsedSuasana = [];
    try {
      parsedFacilities = facilities ? JSON.parse(facilities) : [];
      parsedSuasana = suasana ? JSON.parse(suasana) : [];
    } catch(e) {
      // fallback if they are simple comma separated
      if(typeof facilities === 'string') parsedFacilities = facilities.split(',').map(s => s.trim());
      if(typeof suasana === 'string') parsedSuasana = suasana.split(',').map(s => s.trim());
    }

    let parsedPackages = [];
    try {
      parsedPackages = packages ? JSON.parse(packages) : [];
    } catch(e) {
      console.warn("Failed to parse packages JSON", e);
    }

    // Ambil path file yang diunggah
    let imgPath = null;
    if (req.file) {
      // Path relatif yang dapat diakses oleh public static file
      imgPath = '/uploads/' + req.file.filename;
    }

    const location = await prisma.location.create({
      data: {
        businessId: user.businessProfile.id,
        name,
        category,
        address: address || '',
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        wifiSpeed: parseInt(wifiSpeed) || 0,
        facilities: parsedFacilities,
        suasana: parsedSuasana,
        description: description || '',
        img: imgPath,
        isPublished: true,
        packages: {
          create: parsedPackages.map(pkg => ({
            packageName: pkg.packageName,
            pricePerDay: parseFloat(pkg.pricePerDay) || 0
          }))
        }
      }
    });

    res.status(201).json({ location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create location' });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true }
    });

    if (!user.businessProfile) {
      return res.status(404).json({ error: 'Business profile not found' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        package: {
          location: {
            businessId: user.businessProfile.id
          }
        }
      },
      include: {
        package: {
          include: { location: true }
        },
        user: {
          select: { fullName: true, email: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch owner bookings' });
  }
};

exports.getOwnerStats = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true }
    });

    if (!user.businessProfile) {
      return res.status(404).json({ error: 'Business profile not found' });
    }

    const locations = await prisma.location.count({
      where: { businessId: user.businessProfile.id }
    });

    const bookings = await prisma.booking.findMany({
      where: {
        package: {
          location: {
            businessId: user.businessProfile.id
          }
        }
      },
      include: {
        package: {
          include: { location: true }
        }
      }
    });

    let monthlyRevenue = new Array(12).fill(0);
    let locationStats = {};
    const currentYear = new Date().getFullYear();

    let totalRevenue = 0;

    bookings.forEach(b => {
      const locName = b.package?.location?.name || 'Unknown';
      if (!locationStats[locName]) {
        locationStats[locName] = { name: locName, bookingsCount: 0, revenue: 0 };
      }
      
      locationStats[locName].bookingsCount++;

      if (b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
        const price = Number(b.totalPrice) || 0;
        totalRevenue += price;
        locationStats[locName].revenue += price;
        
        const d = new Date(b.startDate);
        if (d.getFullYear() === currentYear) {
          monthlyRevenue[d.getMonth()] += price;
        }
      }
    });

    res.json({
      locations,
      totalBookings: bookings.length,
      totalRevenue,
      monthlyRevenue,
      locationStats: Object.values(locationStats).sort((a,b) => b.revenue - a.revenue)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true }
    });
    if (!user.businessProfile) return res.status(403).json({ error: 'Not an owner' });

    const locationId = parseInt(req.params.id);
    const existing = await prisma.location.findUnique({ where: { id: locationId } });
    
    if (!existing || existing.businessId !== user.businessProfile.id) {
      return res.status(404).json({ error: 'Location not found or unauthorized' });
    }

    const { name, category, description, address, wifiSpeed, hasPowerOutlet, isPublished, facilities, suasana } = req.body;
    
    // Parse arrays that might be sent as stringified JSON or comma-separated from FormData
    let parsedFacilities = existing.facilities;
    let parsedSuasana = existing.suasana;
    
    if (facilities !== undefined) {
      try {
        parsedFacilities = JSON.parse(facilities);
      } catch(e) {
        if(typeof facilities === 'string') parsedFacilities = facilities.split(',').map(s => s.trim());
      }
    }
    
    if (suasana !== undefined) {
      try {
        parsedSuasana = JSON.parse(suasana);
      } catch(e) {
        if(typeof suasana === 'string') parsedSuasana = suasana.split(',').map(s => s.trim());
      }
    }

    let imgPath = existing.img;
    if (req.file) {
      imgPath = '/uploads/' + req.file.filename;
    }

    const updated = await prisma.location.update({
      where: { id: locationId },
      data: {
        name: name !== undefined ? name : existing.name,
        category: category !== undefined ? category : existing.category,
        description: description !== undefined ? description : existing.description,
        address: address !== undefined ? address : existing.address,
        wifiSpeed: wifiSpeed !== undefined ? parseInt(wifiSpeed) : existing.wifiSpeed,
        hasPowerOutlet: hasPowerOutlet !== undefined ? (hasPowerOutlet === 'true' || hasPowerOutlet === true) : existing.hasPowerOutlet,
        isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : existing.isPublished,
        facilities: parsedFacilities,
        suasana: parsedSuasana,
        img: imgPath
      }
    });
    res.json({ message: 'Location updated successfully', location: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true }
    });
    if (!user.businessProfile) return res.status(403).json({ error: 'Not an owner' });

    const locationId = parseInt(req.params.id);
    const existing = await prisma.location.findUnique({ where: { id: locationId } });
    
    if (!existing || existing.businessId !== user.businessProfile.id) {
      return res.status(404).json({ error: 'Location not found or unauthorized' });
    }

    await prisma.location.delete({ where: { id: locationId } });
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true }
    });
    if (!user.businessProfile) return res.status(403).json({ error: 'Not an owner' });

    const bookingId = parseInt(req.params.id);
    const { status } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { package: { include: { location: true } } }
    });

    if (!booking || booking.package.location.businessId !== user.businessProfile.id) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    });

    res.json({ message: 'Booking status updated successfully', booking: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

exports.getOwnerReviews = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true }
    });
    if (!user.businessProfile) return res.status(403).json({ error: 'Not an owner' });

    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          package: {
            location: {
              businessId: user.businessProfile.id
            }
          }
        }
      },
      include: {
        booking: {
          include: {
            user: { select: { fullName: true, email: true } },
            package: { include: { location: { select: { name: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
