// tests/unit/controllers/auth.controller.test.js
// Unit tests untuk auth controller: register, login, getMe

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authController = require('../../../server/controllers/auth.controller');

describe('Auth Controller: register', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('harus mengembalikan 400 jika fullName, email, atau password tidak ada', async () => {
    req = { body: { email: 'test@mail.com' } }; // tanpa fullName & password
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Please provide fullName, email, and password' });
  });

  test('harus mengembalikan 400 jika email sudah terdaftar', async () => {
    req = { body: { fullName: 'Budi', email: 'budi@mail.com', password: 'pass123' } };
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'budi@mail.com' });
    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email is already registered' });
  });

  test('harus berhasil mendaftarkan user baru dan mengembalikan token', async () => {
    req = { body: { fullName: 'Budi Baru', email: 'baru@mail.com', password: 'pass123' } };
    prisma.user.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedpassword');
    prisma.user.create.mockResolvedValue({ id: 2, fullName: 'Budi Baru', email: 'baru@mail.com', role: 'USER' });
    jwt.sign.mockReturnValue('mock_token');

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'mock_token' }));
  });
});

describe('Auth Controller: login', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('harus mengembalikan 400 jika email atau password tidak ada', async () => {
    req = { body: { email: 'test@mail.com' } };
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('harus mengembalikan 401 jika user tidak ditemukan di database', async () => {
    req = { body: { email: 'tidakada@mail.com', password: 'pass' } };
    prisma.user.findUnique.mockResolvedValue(null);
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  test('harus mengembalikan 401 jika password tidak cocok', async () => {
    req = { body: { email: 'budi@mail.com', password: 'salah' } };
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'budi@mail.com', password: 'hashedpass', role: 'USER' });
    bcrypt.compare.mockResolvedValue(false);
    await authController.login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  test('harus berhasil login dan mengembalikan token JWT', async () => {
    req = { body: { email: 'budi@mail.com', password: 'password123' } };
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'budi@mail.com', password: 'hashedpass', role: 'USER' });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('valid_jwt_token');

    await authController.login(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: 'valid_jwt_token' }));
    // Password tidak boleh ada di dalam respons
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.user).not.toHaveProperty('password');
  });
});

describe('Auth Controller: getMe', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('harus mengembalikan 404 jika user tidak ditemukan', async () => {
    req = { user: { id: 99 } };
    prisma.user.findUnique.mockResolvedValue(null);
    await authController.getMe(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
  });

  test('harus mengembalikan data user jika token valid', async () => {
    const mockUser = { id: 1, fullName: 'Budi', email: 'budi@mail.com', role: 'USER', businessProfile: null, userProfile: null };
    req = { user: { id: 1 } };
    prisma.user.findUnique.mockResolvedValue(mockUser);
    await authController.getMe(req, res);
    expect(res.json).toHaveBeenCalledWith({ user: mockUser });
  });
});
