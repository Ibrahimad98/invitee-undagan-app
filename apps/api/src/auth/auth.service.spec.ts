import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { MailerService } from '../mailer/mailer.service';
import { STORAGE_SERVICE } from '../storage/storage.interface';
import { ConflictException, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
  default: { hash: vi.fn(), compare: vi.fn() },
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let settingsService: any;
  let mailerService: any;
  let storageService: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    fullName: 'Test User',
    phone: null,
    avatarUrl: null,
    role: 'USER',
    subscriptionType: 'BASIC',
    maxGuests: 300,
    isFirstLogin: true,
    isEmailVerified: true,
    emailVerifyToken: null,
    emailVerifyExpires: null,
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
    };

    settingsService = {
      getSystemValue: vi.fn().mockResolvedValue(null),
    };

    mailerService = {
      sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
    };

    storageService = {
      getUrl: vi.fn().mockResolvedValue('https://example.com/avatar.jpg'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: vi.fn().mockReturnValue('http://localhost:3000') } },
        { provide: SettingsService, useValue: settingsService },
        { provide: MailerService, useValue: mailerService },
        { provide: STORAGE_SERVICE, useValue: storageService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return JWT when email verification is disabled', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      });

      expect(result.needsVerification).toBe(false);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, isDeleted: false });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should send verification email when email verification is enabled', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ ...mockUser, isEmailVerified: false, emailVerifyToken: 'token123' });
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
      settingsService.getSystemValue.mockImplementation((key: string) => {
        if (key === 'email_verification') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        baseUrl: 'http://localhost:3000',
      });

      expect(result.needsVerification).toBe(true);
      expect(result.email).toBe('test@example.com');
      expect(mailerService.sendVerificationEmail).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return JWT on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toBeDefined();
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException if email not verified and verification enabled', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, isEmailVerified: false });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      settingsService.getSystemValue.mockImplementation((key: string) => {
        if (key === 'email_verification') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      prisma.user.findFirst.mockResolvedValue({
        ...mockUser,
        isEmailVerified: false,
        emailVerifyToken: 'valid-token',
        emailVerifyExpires: new Date(Date.now() + 86400000),
      });
      prisma.user.update.mockResolvedValue({ ...mockUser, isEmailVerified: true });

      const result = await service.verifyEmail('valid-token');

      expect(result.message).toBe('Email berhasil diverifikasi!');
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw BadRequestException for invalid token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
    });

    it('should return alreadyVerified if email already verified', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...mockUser, isEmailVerified: true });

      const result = await service.verifyEmail('some-token');
      expect(result.alreadyVerified).toBe(true);
    });

    it('should throw BadRequestException for expired token', async () => {
      prisma.user.findFirst.mockResolvedValue({
        ...mockUser,
        isEmailVerified: false,
        emailVerifyToken: 'expired-token',
        emailVerifyExpires: new Date(Date.now() - 1000), // expired
      });

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('markFirstLoginComplete', () => {
    it('should mark first login as complete', async () => {
      prisma.user.update.mockResolvedValue({ ...mockUser, isFirstLogin: false });

      const result = await service.markFirstLoginComplete('user-1');
      expect(result.success).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('should return verified true on correct password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.verifyPassword('user-1', 'correct-password');
      expect(result.verified).toBe(true);
    });

    it('should throw BadRequestException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.verifyPassword('user-1', 'wrong')).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hashed-password' as never);

      const result = await service.changePassword('user-1', {
        currentPassword: 'old-password',
        newPassword: 'new-password',
      });
      expect(result.message).toBe('Password berhasil diubah');
    });

    it('should throw BadRequestException if current password is wrong', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'wrong',
          newPassword: 'new-password',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
