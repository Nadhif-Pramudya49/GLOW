// tests/unit/controllers/productivity.controller.test.js
// Unit tests untuk productivity controller: getItineraries, addItinerary, logMood

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    booking: { findFirst: jest.fn() },
    itinerary: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
    experienceLog: { create: jest.fn(), findMany: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const productivityController = require('../../../server/controllers/productivity.controller');

describe('Productivity Controller: getItineraries', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan 404 jika booking tidak ditemukan', async () => {
    req = { user: { id: 1 }, params: { bookingId: '99' } };
    prisma.booking.findFirst.mockResolvedValue(null);
    await productivityController.getItineraries(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Booking tidak ditemukan atau bukan milik Anda' });
  });

  test('harus mengembalikan daftar itinerary milik booking yang valid', async () => {
    req = { user: { id: 1 }, params: { bookingId: '10' } };
    const mockItineraries = [
      { id: 1, bookingId: 10, dayNumber: 1, activityName: 'Kerja', timeSlot: new Date() },
    ];
    prisma.booking.findFirst.mockResolvedValue({ id: 10, userId: 1 });
    prisma.itinerary.findMany.mockResolvedValue(mockItineraries);

    await productivityController.getItineraries(req, res);

    expect(res.json).toHaveBeenCalledWith(mockItineraries);
  });
});

describe('Productivity Controller: addItinerary', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan 404 jika booking tidak ditemukan', async () => {
    req = {
      user: { id: 1 }, params: { bookingId: '99' },
      body: { dayNumber: 1, activityName: 'Kerja', timeSlot: '09:00' },
    };
    prisma.booking.findFirst.mockResolvedValue(null);
    await productivityController.addItinerary(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('harus berhasil membuat itinerary baru dan mengembalikan 201', async () => {
    req = {
      user: { id: 1 }, params: { bookingId: '10' },
      body: { dayNumber: 1, activityName: 'Deep Work', timeSlot: '09:00', isProductivity: true },
    };
    prisma.booking.findFirst.mockResolvedValue({ id: 10, userId: 1 });
    const mockItinerary = { id: 55, bookingId: 10, activityName: 'Deep Work' };
    prisma.itinerary.create.mockResolvedValue(mockItinerary);

    await productivityController.addItinerary(req, res);

    expect(prisma.itinerary.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockItinerary);
  });
});

describe('Productivity Controller: logMood', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan 404 jika booking tidak ditemukan', async () => {
    req = { user: { id: 1 }, params: { bookingId: '99' }, body: { moodScore: 5 } };
    prisma.booking.findFirst.mockResolvedValue(null);
    await productivityController.logMood(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('harus berhasil mencatat mood dan mengembalikan 201', async () => {
    req = {
      user: { id: 1 }, params: { bookingId: '10' },
      body: { moodScore: 8, note: 'Produktif banget hari ini!' },
    };
    prisma.booking.findFirst.mockResolvedValue({ id: 10, userId: 1 });
    const mockLog = { id: 20, bookingId: 10, moodScore: 8, note: 'Produktif banget hari ini!' };
    prisma.experienceLog.create.mockResolvedValue(mockLog);

    await productivityController.logMood(req, res);

    expect(prisma.experienceLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ moodScore: 8 }),
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockLog);
  });
});
