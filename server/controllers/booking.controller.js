const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ambil riwayat pemesanan milik user yang sedang login
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        package: {
          include: { location: true }
        },
        review: true
      },
      orderBy: { id: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Checkout pemesanan dari keranjang (package builder)
exports.createBooking = async (req, res) => {
  try {
    const { items, startDate, endDate, guestCount, totalPrice } = req.body;
    // items is an array of location objects from the frontend cart

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Keranjang kosong' });
    }

    // Untuk MVP, kita ambil lokasi pertama sebagai "Main Location" untuk membuat Package dinamis
    const mainLocation = items[0];

    // Buat package dinamis (Custom Package) untuk transaksi ini
    const newPackage = await prisma.package.create({
      data: {
        locationId: mainLocation ? mainLocation.id : null,
        packageName: 'Custom Workation Package',
        pricePerDay: mainLocation ? (mainLocation.price || 0) : 0,
        customData: items
      }
    });

    // Buat Booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        packageId: newPackage.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        guestCount: parseInt(guestCount) || 1,
        totalPrice: parseFloat(totalPrice),
        status: 'PENDING'
      }
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
