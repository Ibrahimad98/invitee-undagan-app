import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;

  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    type: 'GENERAL',
    title: 'Test Notification',
    message: 'This is a test',
    linkUrl: '/dashboard',
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      notification: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        createMany: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        count: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('findByUser', () => {
    it('should return notifications with unread count', async () => {
      prisma.notification.findMany.mockResolvedValue([mockNotification]);
      prisma.notification.count.mockResolvedValue(1);

      const result = await service.findByUser('user-1');

      expect(result.data).toHaveLength(1);
      expect(result.unreadCount).toBe(1);
    });

    it('should return empty when no notifications', async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      const result = await service.findByUser('user-1');

      expect(result.data).toHaveLength(0);
      expect(result.unreadCount).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.update.mockResolvedValue({ ...mockNotification, isRead: true });

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(result.isRead).toBe(true);
    });

    it('should throw NotFoundException if notification not found', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('notif-999', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if notification belongs to different user', async () => {
      prisma.notification.findUnique.mockResolvedValue({ ...mockNotification, userId: 'other-user' });

      await expect(service.markAsRead('notif-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead('user-1');

      expect(result.message).toContain('marked as read');
      expect(prisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', isRead: false },
          data: { isRead: true },
        }),
      );
    });
  });

  describe('create', () => {
    it('should create a notification', async () => {
      prisma.notification.create.mockResolvedValue(mockNotification);

      const result = await service.create({
        userId: 'user-1',
        type: 'GENERAL',
        title: 'Test Notification',
        message: 'This is a test',
      });

      expect(result.title).toBe('Test Notification');
    });
  });

  describe('notifyAdmins', () => {
    it('should create notifications for all admins', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'admin-1' }, { id: 'admin-2' }]);
      prisma.notification.createMany.mockResolvedValue({ count: 2 });

      await service.notifyAdmins({
        type: 'GENERAL',
        title: 'Admin Notice',
        message: 'New event happened',
      });

      expect(prisma.notification.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ userId: 'admin-1' }),
            expect.objectContaining({ userId: 'admin-2' }),
          ]),
        }),
      );
    });

    it('should do nothing if no admins exist', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      await service.notifyAdmins({
        type: 'GENERAL',
        title: 'Admin Notice',
        message: 'No admins',
      });

      expect(prisma.notification.createMany).not.toHaveBeenCalled();
    });
  });
});
