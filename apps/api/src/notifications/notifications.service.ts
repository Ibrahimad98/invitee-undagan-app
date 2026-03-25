import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /** Get all notifications for a user */
  async findByUser(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { data: notifications, unreadCount };
  }

  /** Mark a single notification as read */
  async markAsRead(id: string, userId: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /** Mark all notifications as read for a user */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }

  /** Create a notification for a specific user */
  async create(data: {
    userId: string;
    type: any;
    title: string;
    message: string;
    linkUrl?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  /** Notify all admins */
  async notifyAdmins(data: {
    type: any;
    title: string;
    message: string;
    linkUrl?: string;
  }) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isDeleted: false },
      select: { id: true },
    });

    if (admins.length === 0) return;

    await this.prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: data.type,
        title: data.title,
        message: data.message,
        linkUrl: data.linkUrl,
      })),
    });
  }
}
