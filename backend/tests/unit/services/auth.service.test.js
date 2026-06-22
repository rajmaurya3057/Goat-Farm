jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));
jest.mock('../../../src/models/User');
jest.mock('../../../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const User = require('../../../src/models/User');
const authService = require('../../../src/services/auth.service');

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing-tests';
    process.env.JWT_EXPIRE = '1d';
  });

  describe('register', () => {
    it('blocks registration when users already exist', async () => {
      User.countDocuments.mockResolvedValue(1);
      await expect(
        authService.register({ name: 'A', email: 'a@test.com', password: 'Password123' })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it('creates first admin user', async () => {
      User.countDocuments.mockResolvedValue(0);
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: '1',
        name: 'Admin',
        email: 'admin@test.com',
        role: 'ADMIN',
      });

      const result = await authService.register({
        name: 'Admin',
        email: 'admin@test.com',
        password: 'Password123',
      });

      expect(result.role).toBe('ADMIN');
      expect(User.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('rejects invalid credentials', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      await expect(authService.login('x@test.com', 'wrong')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('rejects disabled users', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          isActive: false,
          password: 'hashed-password',
        }),
      });
      bcrypt.compare.mockResolvedValue(true);
      await expect(authService.login('x@test.com', 'Password123')).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });
});
