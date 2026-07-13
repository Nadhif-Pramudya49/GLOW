// tests/unit/controllers/package.controller.test.js
// Unit tests untuk package controller: getSavedPackages, savePackage, deleteSavedPackage

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    savedPackage: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const packageController = require('../../../server/controllers/package.controller');

describe('Package Controller: getSavedPackages', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { user: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan daftar paket tersimpan milik user', async () => {
    const mockPackages = [
      { id: 1, userId: 1, name: 'Paket Hemat', packageData: '{"vibe":"Tenang"}' },
    ];
    prisma.savedPackage.findMany.mockResolvedValue(mockPackages);

    await packageController.getSavedPackages(req, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Paket Hemat', packageData: { vibe: 'Tenang' } }),
    ]);
  });

  test('harus mengembalikan 500 jika terjadi error', async () => {
    prisma.savedPackage.findMany.mockRejectedValue(new Error('DB error'));
    await packageController.getSavedPackages(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('Package Controller: savePackage', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan 400 jika name atau packageData tidak ada', async () => {
    req = { user: { id: 1 }, body: { name: 'Paket Aku' } }; // tanpa packageData
    await packageController.savePackage(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Name and packageData are required' });
  });

  test('harus berhasil menyimpan paket dan mengembalikan 201', async () => {
    req = {
      user: { id: 1 },
      body: { name: 'Paket Solo', packageData: { vibe: 'Tenang', budget: 'Hemat' } },
    };
    const mockSaved = { id: 10, userId: 1, name: 'Paket Solo' };
    prisma.savedPackage.create.mockResolvedValue(mockSaved);

    await packageController.savePackage(req, res);

    expect(prisma.savedPackage.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockSaved);
  });
});

describe('Package Controller: deleteSavedPackage', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test('harus mengembalikan 404 jika paket tidak ditemukan atau bukan milik user', async () => {
    req = { user: { id: 1 }, params: { id: '99' } };
    prisma.savedPackage.findUnique.mockResolvedValue({ id: 99, userId: 5 }); // milik user lain
    await packageController.deleteSavedPackage(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('harus berhasil menghapus paket milik user sendiri', async () => {
    req = { user: { id: 1 }, params: { id: '10' } };
    prisma.savedPackage.findUnique.mockResolvedValue({ id: 10, userId: 1 });
    prisma.savedPackage.delete.mockResolvedValue({});

    await packageController.deleteSavedPackage(req, res);

    expect(prisma.savedPackage.delete).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(res.json).toHaveBeenCalledWith({ message: 'Package deleted' });
  });
});
