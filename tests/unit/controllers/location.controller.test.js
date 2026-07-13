// tests/unit/controllers/location.controller.test.js
// Unit tests untuk location controller: getAllLocations, getLocationById

jest.mock('../../../server/config/database', () => ({
  location: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
}));

const prisma = require('../../../server/config/database');
const locationController = require('../../../server/controllers/location.controller');

describe('Location Controller: getAllLocations', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('harus mengembalikan array lokasi dari database', async () => {
    const mockLocations = [
      { id: 1, name: 'Segara Cafe', category: 'Workspace', rating: 4.9 },
      { id: 2, name: 'Villa Indrayanti', category: 'Penginapan', rating: 4.8 },
    ];
    prisma.location.findMany.mockResolvedValue(mockLocations);

    await locationController.getAllLocations(req, res);

    expect(prisma.location.findMany).toHaveBeenCalledWith({ include: { packages: true } });
    expect(res.json).toHaveBeenCalledWith(mockLocations);
  });

  test('harus mengembalikan array kosong jika tidak ada data', async () => {
    prisma.location.findMany.mockResolvedValue([]);
    await locationController.getAllLocations(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('harus mengembalikan 500 jika terjadi error pada database', async () => {
    prisma.location.findMany.mockRejectedValue(new Error('DB error'));
    await locationController.getAllLocations(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Server error' }));
  });
});

describe('Location Controller: getLocationById', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('harus mengembalikan detail satu lokasi berdasarkan ID valid', async () => {
    const mockLocation = { id: 1, name: 'Segara Cafe', category: 'Workspace' };
    req = { params: { id: '1' } };
    prisma.location.findUnique.mockResolvedValue(mockLocation);

    await locationController.getLocationById(req, res);

    expect(prisma.location.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { packages: true },
    });
    expect(res.json).toHaveBeenCalledWith(mockLocation);
  });

  test('harus mengembalikan 404 jika lokasi tidak ditemukan', async () => {
    req = { params: { id: '999' } };
    prisma.location.findUnique.mockResolvedValue(null);

    await locationController.getLocationById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Lokasi tidak ditemukan' });
  });

  test('harus mengembalikan 500 jika terjadi error database', async () => {
    req = { params: { id: '1' } };
    prisma.location.findUnique.mockRejectedValue(new Error('DB Connection failed'));

    await locationController.getLocationById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
