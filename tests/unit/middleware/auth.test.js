// tests/unit/middleware/auth.test.js
// Unit tests untuk middleware verifyToken dan requireRole

const jwt = require('jsonwebtoken');
const { verifyToken, requireRole, JWT_SECRET } = require('../../../server/middlewares/auth');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('Middleware: verifyToken', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('harus mengembalikan 401 jika tidak ada header Authorization', async () => {
    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('harus mengembalikan 401 jika header Authorization tidak diawali Bearer', async () => {
    req.headers.authorization = 'Basic sometoken';
    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('harus mengembalikan 401 jika token tidak valid (invalid signature)', async () => {
    req.headers.authorization = 'Bearer invalidtoken';
    jwt.verify.mockImplementation(() => { throw new Error('invalid signature'); });
    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('harus memanggil next() dan set req.user jika token valid', async () => {
    const decodedUser = { id: 1, role: 'USER', email: 'test@mail.com' };
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify.mockReturnValue(decodedUser);
    await verifyToken(req, res, next);
    expect(req.user).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('Middleware: requireRole', () => {
  let req, res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('harus mengembalikan 403 jika req.user tidak ada', () => {
    req = {};
    requireRole(['ADMIN'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Insufficient role permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  test('harus mengembalikan 403 jika role pengguna tidak termasuk dalam daftar yang diizinkan', () => {
    req = { user: { id: 1, role: 'USER' } };
    requireRole(['ADMIN'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('harus memanggil next() jika role pengguna sesuai', () => {
    req = { user: { id: 2, role: 'ADMIN' } };
    requireRole(['ADMIN', 'OWNER'])(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('harus memanggil next() untuk role OWNER jika daftar izin menyertakan OWNER', () => {
    req = { user: { id: 3, role: 'OWNER' } };
    requireRole(['ADMIN', 'OWNER'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
