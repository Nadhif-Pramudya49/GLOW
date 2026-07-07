const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get itineraries for a specific booking
exports.getItineraries = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Verify booking belongs to user
    const booking = await prisma.booking.findFirst({
      where: { id: parseInt(bookingId), userId: req.user.id }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan atau bukan milik Anda' });
    }

    const itineraries = await prisma.itinerary.findMany({
      where: { bookingId: parseInt(bookingId) },
      orderBy: { timeSlot: 'asc' }
    });

    res.json(itineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
};

// Add a new itinerary to a booking
exports.addItinerary = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { dayNumber, activityName, timeSlot, isProductivity } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id: parseInt(bookingId), userId: req.user.id }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan' });
    }
    
    // Parse timeSlot as a complete datetime
    const baseDate = new Date();
    const [hours, minutes] = timeSlot.split(':');
    baseDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    const itinerary = await prisma.itinerary.create({
      data: {
        bookingId: parseInt(bookingId),
        dayNumber: parseInt(dayNumber) || 1,
        activityName,
        timeSlot: baseDate,
        isProductivity: Boolean(isProductivity)
      }
    });

    res.status(201).json(itinerary);
  } catch (error) {
    console.error('Error adding itinerary:', error);
    res.status(500).json({ error: 'Failed to add itinerary' });
  }
};

exports.deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: parseInt(id) },
      include: { booking: true }
    });
    
    if (!itinerary || itinerary.booking.userId !== req.user.id) {
      return res.status(404).json({ error: 'Itinerary tidak ditemukan' });
    }

    await prisma.itinerary.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Itinerary dihapus' });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({ error: 'Failed to delete itinerary' });
  }
};

// Log mood check-in
exports.logMood = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { moodScore, note } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id: parseInt(bookingId), userId: req.user.id }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking tidak ditemukan' });
    }

    const moodLog = await prisma.experienceLog.create({
      data: {
        bookingId: parseInt(bookingId),
        moodScore: parseInt(moodScore),
        note: note || ''
      }
    });

    res.status(201).json(moodLog);
  } catch (error) {
    console.error('Error logging mood:', error);
    res.status(500).json({ error: 'Failed to log mood' });
  }
};

exports.getMoodLogs = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const logs = await prisma.experienceLog.findMany({
      where: { 
        bookingId: parseInt(bookingId),
        booking: { userId: req.user.id }
      },
      orderBy: { loggedAt: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching mood logs:', error);
    res.status(500).json({ error: 'Failed to fetch mood logs' });
  }
};
