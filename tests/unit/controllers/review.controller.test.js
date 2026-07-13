// tests/unit/controllers/review.controller.test.js
// Unit tests untuk review controller: createReview, getReviewsByLocation

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    booking: { findFirst: jest.fn() },
    review: { create: jest.fn(), findMany: jest.fn() },
    location: { update: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const reviewController = require('../../../server/controllers/review.controller');

describe('Review Controller: createReview', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan 400 jika bookingId atau rating tidak ada', async () => {
    req = { user: { id: 1 }, body: { rating: 5 } }; // tanpa bookingId
    await reviewController.createReview(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'bookingId dan rating diperlukan.' });
  });

  test('harus mengembalikan 404 jika booking tidak ditemukan atau bukan milik user', async () => {
    req = { user: { id: 1 }, body: { bookingId: 99, rating: 4 } };
    prisma.booking.findFirst.mockResolvedValue(null);
    await reviewController.createReview(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Booking tidak ditemukan atau bukan milik Anda.' });
  });

  test('harus mengembalikan 400 jika booking sudah pernah diulas', async () => {
    req = { user: { id: 1 }, body: { bookingId: 10, rating: 5 } };
    prisma.booking.findFirst.mockResolvedValue({
      id: 10,
      review: { id: 1, rating: 4 }, // sudah ada review
      package: { locationId: 1 },
    });
    await reviewController.createReview(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Anda sudah mengulas booking ini.' });
  });

  test('harus berhasil membuat ulasan baru dan mengembalikan 201', async () => {
    req = {
      user: { id: 1 },
      body: { bookingId: 10, rating: 5, comment: 'Mantap!' },
    };
    prisma.booking.findFirst.mockResolvedValue({
      id: 10,
      review: null,
      package: { locationId: 2 },
    });
    const mockNewReview = { id: 55, rating: 5, comment: 'Mantap!' };
    prisma.review.create.mockResolvedValue(mockNewReview);
    prisma.review.findMany.mockResolvedValue([{ rating: 5 }, { rating: 4 }]);
    prisma.location.update.mockResolvedValue({});

    await reviewController.createReview(req, res);

    expect(prisma.review.create).toHaveBeenCalled();
    expect(prisma.location.update).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Ulasan berhasil disimpan.',
      data: mockNewReview,
    }));
  });
});

describe('Review Controller: getReviewsByLocation', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan daftar ulasan yang sudah diformat', async () => {
    req = { params: { locationId: '1' } };
    const mockReviews = [
      {
        id: 1, rating: 5, wifiRating: 4, workspaceRating: 5, ambienceRating: 5,
        comment: 'Bagus!', createdAt: '2026-01-01',
        booking: { user: { fullName: 'Budi Nomad' } },
      },
    ];
    prisma.review.findMany.mockResolvedValue(mockReviews);

    await reviewController.getReviewsByLocation(req, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ userName: 'Budi Nomad', rating: 5 }),
    ]);
  });

  test('harus mengembalikan array kosong jika tidak ada ulasan', async () => {
    req = { params: { locationId: '999' } };
    prisma.review.findMany.mockResolvedValue([]);
    await reviewController.getReviewsByLocation(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('harus mengembalikan 500 jika terjadi error database', async () => {
    req = { params: { locationId: '1' } };
    prisma.review.findMany.mockRejectedValue(new Error('DB error'));
    await reviewController.getReviewsByLocation(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
