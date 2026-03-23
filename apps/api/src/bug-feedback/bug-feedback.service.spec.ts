import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BugFeedbackService } from './bug-feedback.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';

describe('BugFeedbackService', () => {
  let service: BugFeedbackService;
  let prisma: any;
  let notificationsService: any;

  const mockFeedback = {
    id: 'fb-1',
    userId: 'user-1',
    userName: 'Test User',
    subject: 'Bug: Login issue',
    message: 'Cannot login with Google',
    category: 'bug',
    status: 'UNHANDLED',
    adminNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      bugFeedback: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
    };

    notificationsService = {
      notifyAdmins: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BugFeedbackService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<BugFeedbackService>(BugFeedbackService);
  });

  describe('findAll', () => {
    it('should return all feedbacks with unhandled count', async () => {
      prisma.bugFeedback.findMany.mockResolvedValue([mockFeedback]);
      prisma.bugFeedback.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.unhandledCount).toBe(1);
    });

    it('should filter by status', async () => {
      prisma.bugFeedback.findMany.mockResolvedValue([]);
      prisma.bugFeedback.count.mockResolvedValue(0);

      await service.findAll('HANDLED');

      expect(prisma.bugFeedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'HANDLED' },
        }),
      );
    });
  });

  describe('findByUser', () => {
    it('should return feedbacks for a specific user', async () => {
      prisma.bugFeedback.findMany.mockResolvedValue([mockFeedback]);

      const result = await service.findByUser('user-1');

      expect(result.data).toHaveLength(1);
      expect(prisma.bugFeedback.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
    });
  });

  describe('create', () => {
    it('should create feedback and notify admins', async () => {
      prisma.bugFeedback.create.mockResolvedValue(mockFeedback);

      const result = await service.create('user-1', 'Test User', {
        subject: 'Bug: Login issue',
        message: 'Cannot login with Google',
        category: 'bug',
      });

      expect(result.subject).toBe('Bug: Login issue');
      expect(notificationsService.notifyAdmins).toHaveBeenCalled();
    });
  });

  describe('markHandled', () => {
    it('should mark feedback as handled and notify user', async () => {
      prisma.bugFeedback.findUnique.mockResolvedValue(mockFeedback);
      prisma.bugFeedback.update.mockResolvedValue({ ...mockFeedback, status: 'HANDLED', adminNote: 'Fixed' });

      const result = await service.markHandled('fb-1', 'Fixed');

      expect(result.status).toBe('HANDLED');
      expect(result.adminNote).toBe('Fixed');
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'REQUEST_APPROVED',
        }),
      );
    });

    it('should throw NotFoundException if feedback not found', async () => {
      prisma.bugFeedback.findUnique.mockResolvedValue(null);

      await expect(service.markHandled('fb-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markUnhandled', () => {
    it('should mark feedback as unhandled', async () => {
      prisma.bugFeedback.findUnique.mockResolvedValue({ ...mockFeedback, status: 'HANDLED' });
      prisma.bugFeedback.update.mockResolvedValue({ ...mockFeedback, status: 'UNHANDLED', adminNote: null });

      const result = await service.markUnhandled('fb-1');

      expect(result.status).toBe('UNHANDLED');
    });

    it('should throw NotFoundException if feedback not found', async () => {
      prisma.bugFeedback.findUnique.mockResolvedValue(null);

      await expect(service.markUnhandled('fb-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete feedback', async () => {
      prisma.bugFeedback.findUnique.mockResolvedValue(mockFeedback);
      prisma.bugFeedback.delete.mockResolvedValue(mockFeedback);

      const result = await service.remove('fb-1');

      expect(result.message).toContain('deleted');
    });

    it('should throw NotFoundException if feedback not found', async () => {
      prisma.bugFeedback.findUnique.mockResolvedValue(null);

      await expect(service.remove('fb-999')).rejects.toThrow(NotFoundException);
    });
  });
});
