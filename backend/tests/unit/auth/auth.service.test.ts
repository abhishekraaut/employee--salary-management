import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { authRepository } from '../../../src/modules/auth/auth.repository';
import { UnauthorizedError } from '../../../src/common/errors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../../../src/modules/auth/auth.repository');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  describe('login', () => {
    it('throws UnauthorizedError if user not found', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

      await expect(authService.login('unknown@test.com', 'pass')).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError if password does not match', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        name: 'Test',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(authService.login('test@test.com', 'wrong-pass')).rejects.toThrow(UnauthorizedError);
    });

    it('returns a token and user details if credentials are correct', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({
        id: '1',
        tenantId: 'tenant-1',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      // We don't strictly need to mock jwt.sign because env handles secret, but it's fine for unit test.
      const result = await authService.login('test@test.com', 'correct-pass');
      expect(result.token).toBeTypeOf('string');
      expect(result.user).toEqual({ id: '1', name: 'Test User', tenantId: 'tenant-1' });
    });
  });

  describe('verifyToken', () => {
    it('throws UnauthorizedError for malformed tokens', () => {
      expect(() => authService.verifyToken('bad-token')).toThrow(UnauthorizedError);
    });

    it('decodes a valid token', () => {
      const validToken = jwt.sign(
        { id: '1', tenantId: 'tenant-1', email: 'test@test.com' },
        process.env.JWT_SECRET || 'secret'
      );
      const user = authService.verifyToken(validToken);
      expect(user).toEqual({ id: '1', tenantId: 'tenant-1', email: 'test@test.com' });
    });
  });
});