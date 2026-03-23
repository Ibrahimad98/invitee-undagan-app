import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_SERVICE } from '../storage/storage.interface';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('InvitationsService', () => {
  let service: InvitationsService;
  let prisma: any;
  let storageService: any;

  const mockInvitation = {
    id: 'inv-1',
    userId: 'user-1',
    title: 'Pernikahan Budi & Ani',
    slug: 'budi-ani',
    eventType: 'WEDDING',
    isPublished: false,
    viewCount: 10,
    openingText: 'Hello',
    closingText: 'Goodbye',
    createdAt: new Date(),
    updatedAt: new Date(),
    media: [],
    personProfiles: [],
    events: [],
    giftAccounts: [],
    coInvitors: [],
    templates: [],
  };

  beforeEach(async () => {
    prisma = {
      invitation: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      rsvp: {
        groupBy: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    storageService = {
      getUrl: vi.fn().mockImplementation((key: string) => Promise.resolve(`https://s3.example.com/${key}`)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: STORAGE_SERVICE, useValue: storageService },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
  });

  describe('findAllByUser', () => {
    it('should return paginated invitations for user', async () => {
      prisma.invitation.findMany.mockResolvedValue([mockInvitation]);
      prisma.invitation.count.mockResolvedValue(1);

      const result = await service.findAllByUser('user-1');

      expect(result.data).toBeDefined();
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(prisma.invitation.findMany).toHaveBeenCalled();
    });

    it('should handle pagination params', async () => {
      prisma.invitation.findMany.mockResolvedValue([]);
      prisma.invitation.count.mockResolvedValue(0);

      const result = await service.findAllByUser('user-1', 2, 5);

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
    });
  });

  describe('findById', () => {
    it('should return an invitation with resolved URLs', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        ...mockInvitation,
        guests: [],
        rsvps: [],
      });

      const result = await service.findById('inv-1', 'user-1');

      expect(result).toBeDefined();
      expect(result!.title).toBe('Pernikahan Budi & Ani');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);

      await expect(service.findById('inv-999', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not own invitation', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        ...mockInvitation,
        userId: 'other-user',
        guests: [],
        rsvps: [],
      });

      await expect(service.findById('inv-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findBySlugPublic', () => {
    it('should return invitation by slug and increment view count', async () => {
      prisma.invitation.findUnique.mockResolvedValue(mockInvitation);
      prisma.invitation.update.mockResolvedValue(mockInvitation);

      const result = await service.findBySlugPublic('budi-ani');

      expect(result).toBeDefined();
      expect(prisma.invitation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { viewCount: { increment: 1 } },
        }),
      );
    });

    it('should throw NotFoundException if slug not found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);

      await expect(service.findBySlugPublic('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete invitation for owner', async () => {
      prisma.invitation.findUnique.mockResolvedValue(mockInvitation);
      prisma.invitation.delete.mockResolvedValue(mockInvitation);

      const result = await service.remove('inv-1', 'user-1');

      expect(result.message).toContain('deleted');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);

      await expect(service.remove('inv-999', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      prisma.invitation.findUnique.mockResolvedValue({ ...mockInvitation, userId: 'other-user' });

      await expect(service.remove('inv-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      prisma.invitation.count.mockResolvedValue(3);
      prisma.invitation.findMany
        .mockResolvedValueOnce([{ viewCount: 10 }, { viewCount: 20 }]) // invitations with viewCount
        .mockResolvedValueOnce([]); // recentInvitations
      prisma.rsvp.groupBy.mockResolvedValue([
        { attendance: 'ATTENDING', _count: 5 },
        { attendance: 'NOT_ATTENDING', _count: 2 },
      ]);

      const result = await service.getDashboardStats('user-1');

      expect(result.totalInvitations).toBe(3);
      expect(result.totalViews).toBe(30);
      expect(result.attendingCount).toBe(5);
      expect(result.notAttendingCount).toBe(2);
      expect(result.totalRsvps).toBe(7);
    });
  });

  describe('exportToExcel', () => {
    it('should throw ForbiddenException for BASIC users', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', subscriptionType: 'BASIC', role: 'USER' });

      await expect(service.exportToExcel('user-1', 'inv-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if no invitationId', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', subscriptionType: 'PREMIUM', role: 'USER' });

      await expect(service.exportToExcel('user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if invitation not found', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', subscriptionType: 'PREMIUM', role: 'USER' });
      prisma.invitation.findFirst.mockResolvedValue(null);

      await expect(service.exportToExcel('user-1', 'inv-999')).rejects.toThrow(NotFoundException);
    });
  });
});
