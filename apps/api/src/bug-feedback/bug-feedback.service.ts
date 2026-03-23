import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBugFeedbackDto } from './dto/create-bug-feedback.dto';

@Injectable()
export class BugFeedbackService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /** Get all bug feedbacks (admin) */
  async findAll(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const feedbacks = await this.prisma.bugFeedback.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const unhandledCount = await this.prisma.bugFeedback.count({
      where: { status: 'UNHANDLED' },
    });

    return { data: feedbacks, unhandledCount };
  }

  /** Get bug feedbacks by user */
  async findByUser(userId: string) {
    const feedbacks = await this.prisma.bugFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: feedbacks };
  }

  /** Create a bug feedback */
  async create(userId: string, userName: string, dto: CreateBugFeedbackDto) {
    const feedback = await this.prisma.bugFeedback.create({
      data: {
        userId,
        userName,
        subject: dto.subject,
        message: dto.message,
        category: dto.category || 'bug',
      },
    });

    // Notify admins
    await this.notificationsService.notifyAdmins({
      type: 'BUG_FEEDBACK_NEW',
      title: 'Laporan Bug Baru',
      message: `${userName} melaporkan: ${dto.subject}`,
      linkUrl: '/dashboard/testimonials?tab=bugs',
    });

    return feedback;
  }

  /** Admin marks a bug feedback as handled */
  async markHandled(id: string, adminNote?: string) {
    const feedback = await this.prisma.bugFeedback.findUnique({ where: { id } });
    if (!feedback) throw new NotFoundException('Bug feedback not found');

    const updated = await this.prisma.bugFeedback.update({
      where: { id },
      data: { status: 'HANDLED', adminNote },
    });

    // Notify user
    await this.notificationsService.create({
      userId: feedback.userId,
      type: 'REQUEST_APPROVED',
      title: 'Laporan Bug Ditangani',
      message: `Laporan "${feedback.subject}" telah ditangani oleh admin.${adminNote ? ` Catatan: ${adminNote}` : ''}`,
      linkUrl: '/dashboard/testimonials',
    });

    return updated;
  }

  /** Admin marks a bug feedback as unhandled */
  async markUnhandled(id: string) {
    const feedback = await this.prisma.bugFeedback.findUnique({ where: { id } });
    if (!feedback) throw new NotFoundException('Bug feedback not found');

    return this.prisma.bugFeedback.update({
      where: { id },
      data: { status: 'UNHANDLED', adminNote: null },
    });
  }

  /** Delete a bug feedback */
  async remove(id: string) {
    const feedback = await this.prisma.bugFeedback.findUnique({ where: { id } });
    if (!feedback) throw new NotFoundException('Bug feedback not found');

    await this.prisma.bugFeedback.delete({ where: { id } });
    return { message: 'Bug feedback deleted' };
  }
}
