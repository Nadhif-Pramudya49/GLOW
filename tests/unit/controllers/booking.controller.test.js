// tests/unit/controllers/booking.controller.test.js
// Unit tests untuk booking controller: getMyBookings, createBooking

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    booking: { findMany: jest.fn(), create: jest.fn() },
    package: { create: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bookingController = require('../../../server/controllers/booking.controller');

describe('Booking Controller: getMyBookings', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { user: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan daftar booking milik user yang login', async () => {
    const mockBookings = [
      { id: 10, userId: 1, status: 'PENDING', package: { location: { name: 'Segara Cafe' } } },
    ];
    prisma.booking.findMany.mockResolvedValue(mockBookings);

    await bookingController.getMyBookings(req, res);

    expect(prisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1 },
    }));
    expect(res.json).toHaveBeenCalledWith(mockBookings);
  });

  test('harus mengembalikan array kosong jika user belum punya booking', async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    await bookingController.getMyBookings(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('harus mengembalikan 500 jika terjadi error database', async () => {
    prisma.booking.findMany.mockRejectedValue(new Error('DB error'));
    await bookingController.getMyBookings(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch bookings' });
  });
});

describe('Booking Controller: createBooking', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan 400 jika items kosong atau tidak ada', async () => {
    req = { user: { id: 1 }, body: { items: [] } };
    await bookingController.createBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Keranjang kosong' });
  });

  test('harus berhasil membuat booking baru dan mengembalikan 201', async () => {
    req = {
      user: { id: 1 },
      body: {
        items: [{ id: 5, name: 'Segara Cafe', price: 50000 }],
        startDate: '2026-08-01',
        endDate: '2026-08-03',
        guestCount: 2,
        totalPrice: 100000,
      },
    };
    const mockPackage = { id: 99, packageName: 'Custom Workation Package' };
    const mockBooking = { id: 101, userId: 1, packageId: 99, status: 'PENDING' };

    prisma.package.create.mockResolvedValue(mockPackage);
    prisma.booking.create.mockResolvedValue(mockBooking);

    await bookingController.createBooking(req, res);

    expect(prisma.package.create).toHaveBeenCalled();
    expect(prisma.booking.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 1, status: 'PENDING' }),
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Booking created successfully',
      booking: mockBooking,
    }));
  });

  test('harus mengembalikan 500 jika terjadi error database saat create', async () => {
    req = {
      user: { id: 1 },
      body: {
        items: [{ id: 5, name: 'Cafe', price: 50000 }],
        startDate: '2026-08-01', endDate: '2026-08-03',
        guestCount: 1, totalPrice: 50000,
      },
    };
    prisma.package.create.mockRejectedValue(new Error('DB error'));
    await bookingController.createBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create booking' });
  });
});
