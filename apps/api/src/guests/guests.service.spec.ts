import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GuestsService } from './guests.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('GuestsService', () => {
  let service: GuestsService;
  let prisma: any;

  const mockGuest = {
    id: 'guest-1',
    invitationId: 'inv-1',
    name: 'John Doe',
    phone: '081234567890',
    email: 'john@example.com',
    groupName: 'Keluarga',
    isSent: false,
    sentAt: null,
    sentVia: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      guest: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        createMany: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      invitation: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<GuestsService>(GuestsService);
  });

  describe('findAllByInvitation', () => {
    it('should return paginated guests', async () => {
      prisma.guest.findMany.mockResolvedValue([mockGuest]);
      prisma.guest.count.mockResolvedValue(1);

      const result = await service.findAllByInvitation('inv-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should handle pagination params', async () => {
      prisma.guest.findMany.mockResolvedValue([]);
      prisma.guest.count.mockResolvedValue(0);

      const result = await service.findAllByInvitation('inv-1', 2, 10);

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('create', () => {
    it('should create a guest', async () => {
      // Mock guest limit check
      prisma.invitation.findUnique.mockResolvedValue({ userId: 'user-1' });
      prisma.user.findUnique.mockResolvedValue({ maxGuests: 300 });
      prisma.guest.count.mockResolvedValue(10);
      prisma.guest.create.mockResolvedValue(mockGuest);

      const result = await service.create({
        invitationId: 'inv-1',
        name: 'John Doe',
        phone: '081234567890',
      });

      expect(result.name).toBe('John Doe');
    });

    it('should throw BadRequestException when guest limit exceeded', async () => {
      prisma.invitation.findUnique.mockResolvedValue({ userId: 'user-1' });
      prisma.user.findUnique.mockResolvedValue({ maxGuests: 10 });
      prisma.guest.count.mockResolvedValue(10);

      await expect(
        service.create({ invitationId: 'inv-1', name: 'New Guest' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a guest', async () => {
      prisma.guest.findUnique.mockResolvedValue(mockGuest);
      prisma.guest.update.mockResolvedValue({ ...mockGuest, name: 'Jane Doe' });

      const result = await service.update('guest-1', { name: 'Jane Doe' });

      expect(result.name).toBe('Jane Doe');
    });

    it('should throw NotFoundException if guest not found', async () => {
      prisma.guest.findUnique.mockResolvedValue(null);

      await expect(service.update('guest-999', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a guest', async () => {
      prisma.guest.findUnique.mockResolvedValue(mockGuest);
      prisma.guest.delete.mockResolvedValue(mockGuest);

      const result = await service.remove('guest-1');

      expect(result.message).toContain('deleted');
    });

    it('should throw NotFoundException if guest not found', async () => {
      prisma.guest.findUnique.mockResolvedValue(null);

      await expect(service.remove('guest-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('importGuests', () => {
    it('should import multiple guests', async () => {
      prisma.invitation.findUnique.mockResolvedValue({ userId: 'user-1' });
      prisma.user.findUnique.mockResolvedValue({ maxGuests: 300 });
      prisma.guest.count.mockResolvedValue(0);
      prisma.guest.createMany.mockResolvedValue({ count: 3 });

      const result = await service.importGuests({
        invitationId: 'inv-1',
        guests: [
          { name: 'Guest 1' },
          { name: 'Guest 2' },
          { name: 'Guest 3' },
        ],
      });

      expect(result.count).toBe(3);
      expect(result.message).toContain('3');
    });
  });

  describe('markAsSent', () => {
    it('should mark a guest as sent', async () => {
      prisma.guest.update.mockResolvedValue({
        ...mockGuest,
        isSent: true,
        sentVia: 'whatsapp',
        sentAt: new Date(),
      });

      const result = await service.markAsSent('guest-1', 'whatsapp');

      expect(result.isSent).toBe(true);
      expect(result.sentVia).toBe('whatsapp');
    });
  });

  describe('markManySent', () => {
    it('should mark multiple guests as sent', async () => {
      prisma.guest.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markManySent(['g-1', 'g-2', 'g-3'], 'whatsapp');

      expect(result.count).toBe(3);
      expect(result.message).toContain('3');
    });
  });
});
