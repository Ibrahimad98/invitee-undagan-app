import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { STORAGE_SERVICE } from '../storage/storage.interface';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;
  let notificationsService: any;
  let storageService: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    fullName: 'Test User',
    phone: '081234567890',
    avatarUrl: null,
    role: 'USER',
    subscriptionType: 'BASIC',
    maxGuests: 300,
    isFirstLogin: false,
    isEmailVerified: true,
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      guestLimitRequest: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    notificationsService = {
      create: vi.fn().mockResolvedValue({}),
      notifyAdmins: vi.fn().mockResolvedValue(undefined),
    };

    storageService = {
      getUrl: vi.fn().mockResolvedValue('https://example.com/avatar.jpg'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: STORAGE_SERVICE, useValue: storageService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findById', () => {
    it('should return user without password hash', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toBeDefined();
      expect(result.passwordHash).toBeUndefined();
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return array of users without password hashes', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0].passwordHash).toBeUndefined();
    });

    it('should filter by search term', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      await service.findAll('test');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isDeleted: false,
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update user and return without password', async () => {
      prisma.user.update.mockResolvedValue({ ...mockUser, fullName: 'Updated Name' });

      const result = await service.update('user-1', { fullName: 'Updated Name' });

      expect(result.fullName).toBe('Updated Name');
      expect(result.passwordHash).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should soft-delete the user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, isDeleted: true });

      const result = await service.remove('user-1');

      expect(result.message).toContain('berhasil dihapus');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({ isDeleted: true }),
        }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('adminUpdate', () => {
    it('should update user role and subscription', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, role: 'ADMIN', subscriptionType: 'PREMIUM' });

      const result = await service.adminUpdate('user-1', {
        role: 'ADMIN',
        subscriptionType: 'PREMIUM',
      });

      expect(result.role).toBe('ADMIN');
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.adminUpdate('nonexistent', { fullName: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('requestWhatsappOtp', () => {
    it('should generate OTP and return WhatsApp URL', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isWhatsappVerified: false,
      });
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.requestWhatsappOtp('user-1');

      expect(result.waUrl).toBeDefined();
      expect(result.waUrl).toContain('api.whatsapp.com');
      expect(result.phone).toBe('081234567890');
      expect(result.expiresAt).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            whatsappOtp: expect.any(String),
            whatsappOtpExpires: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw if phone not set', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, phone: null });

      await expect(service.requestWhatsappOtp('user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if already verified', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isWhatsappVerified: true,
      });

      await expect(service.requestWhatsappOtp('user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmWhatsappOtp', () => {
    it('should verify OTP and mark WhatsApp as verified', async () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000);
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isWhatsappVerified: false,
        whatsappOtp: '123456',
        whatsappOtpExpires: futureDate,
      });
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        isWhatsappVerified: true,
        whatsappOtp: null,
        whatsappOtpExpires: null,
      });

      const result = await service.confirmWhatsappOtp('user-1', '123456');

      expect(result.message).toContain('berhasil diverifikasi');
      expect(result.user).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isWhatsappVerified: true,
            whatsappOtp: null,
            whatsappOtpExpires: null,
          }),
        }),
      );
    });

    it('should throw if OTP is wrong', async () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000);
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isWhatsappVerified: false,
        whatsappOtp: '123456',
        whatsappOtpExpires: futureDate,
      });

      await expect(service.confirmWhatsappOtp('user-1', '999999')).rejects.toThrow(BadRequestException);
    });

    it('should throw if OTP is expired', async () => {
      const pastDate = new Date(Date.now() - 60 * 1000);
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isWhatsappVerified: false,
        whatsappOtp: '123456',
        whatsappOtpExpires: pastDate,
      });

      await expect(service.confirmWhatsappOtp('user-1', '123456')).rejects.toThrow(BadRequestException);
    });

    it('should throw if no OTP was requested', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isWhatsappVerified: false,
        whatsappOtp: null,
        whatsappOtpExpires: null,
      });

      await expect(service.confirmWhatsappOtp('user-1', '123456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update - phone change resets WA verification', () => {
    it('should reset isWhatsappVerified when phone changes', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        phone: '081234567890',
        isWhatsappVerified: true,
      });
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        phone: '089999999999',
        isWhatsappVerified: false,
      });

      await service.update('user-1', { phone: '089999999999' });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone: '089999999999',
            isWhatsappVerified: false,
            whatsappOtp: null,
            whatsappOtpExpires: null,
          }),
        }),
      );
    });
  });
});
