// tests/unit/controllers/favorite.controller.test.js
// Unit tests untuk favorite controller: getFavorites, addFavorite, removeFavorite

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    favorite: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const favoriteController = require('../../../server/controllers/favorite.controller');

describe('Favorite Controller: getFavorites', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { user: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan daftar favorit user beserta data lokasi', async () => {
    const mockFavs = [
      { id: 1, userId: 1, locationId: 5, location: { name: 'Pantai Indrayanti' } },
    ];
    prisma.favorite.findMany.mockResolvedValue(mockFavs);

    await favoriteController.getFavorites(req, res);

    expect(prisma.favorite.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1 },
      include: { location: true },
    }));
    expect(res.json).toHaveBeenCalledWith(mockFavs);
  });

  test('harus mengembalikan 500 jika database error', async () => {
    prisma.favorite.findMany.mockRejectedValue(new Error('Connection error'));
    await favoriteController.getFavorites(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Favorite Controller: addFavorite', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan 400 jika locationId tidak dikirim', async () => {
    req = { user: { id: 1 }, body: {} };
    await favoriteController.addFavorite(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'locationId is required' });
  });

  test('harus berhasil menambahkan favorit (upsert) dan mengembalikan 201', async () => {
    req = { user: { id: 1 }, body: { locationId: 5 } };
    const mockFav = { id: 10, userId: 1, locationId: 5 };
    prisma.favorite.upsert.mockResolvedValue(mockFav);

    await favoriteController.addFavorite(req, res);

    expect(prisma.favorite.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_locationId: { userId: 1, locationId: 5 } },
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockFav);
  });
});

describe('Favorite Controller: removeFavorite', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus berhasil menghapus favorit berdasarkan locationId', async () => {
    req = { user: { id: 1 }, params: { locationId: '5' } };
    prisma.favorite.delete.mockResolvedValue({});

    await favoriteController.removeFavorite(req, res);

    expect(prisma.favorite.delete).toHaveBeenCalledWith({
      where: { userId_locationId: { userId: 1, locationId: 5 } },
    });
    expect(res.json).toHaveBeenCalledWith({ message: 'Favorite removed' });
  });

  test('harus mengembalikan 500 jika gagal menghapus dari database', async () => {
    req = { user: { id: 1 }, params: { locationId: '5' } };
    prisma.favorite.delete.mockRejectedValue(new Error('Record not found'));

    await favoriteController.removeFavorite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
