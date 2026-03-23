import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(page = 1, limit = 20, approvedOnly = true) {
    const skip = (page - 1) * limit;
    const where = approvedOnly ? { isApproved: true } : {};

    const [testimonials, total] = await Promise.all([
      this.prisma.testimonial.findMany({
        where,
        include: {
          template: {
            select: { id: true, name: true, slug: true, thumbnailUrl: true, category: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.testimonial.count({ where }),
    ]);

    return {
      data: testimonials,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUser(userId: string) {
    const testimonials = await this.prisma.testimonial.findMany({
      where: { userId },
      include: {
        template: {
          select: { id: true, name: true, slug: true, thumbnailUrl: true, category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: testimonials };
  }

  /**
   * Get all templates the user has used (via published invitations)
   * along with whether they have already reviewed each one.
   */
  async findUserTemplatesForReview(userId: string) {
    // Get all templates the user has used through their invitations
    const userInvitations = await this.prisma.invitation.findMany({
      where: { userId, isPublished: true },
      select: {
        id: true,
        title: true,
        templates: {
          include: { template: true },
        },
      },
    });

    // Collect unique template IDs
    const templateMap = new Map<string, { template: any; invitationTitle: string }>();
    for (const inv of userInvitations) {
      for (const it of inv.templates) {
        if (it.template && !templateMap.has(it.template.id)) {
          templateMap.set(it.template.id, {
            template: it.template,
            invitationTitle: inv.title,
          });
        }
      }
    }

    // Get existing reviews by this user
    const existingReviews = await this.prisma.testimonial.findMany({
      where: {
        userId,
        templateId: { in: Array.from(templateMap.keys()) },
      },
    });

    const reviewedTemplateIds = new Set(existingReviews.map((r) => r.templateId));

    const result = Array.from(templateMap.entries()).map(([templateId, { template, invitationTitle }]) => ({
      template: {
        id: template.id,
        name: template.name,
        slug: template.slug,
        thumbnailUrl: template.thumbnailUrl,
        category: template.category,
        cssClass: template.cssClass,
        ratingAvg: template.ratingAvg,
        ratingCount: template.ratingCount,
      },
      invitationTitle,
      hasReviewed: reviewedTemplateIds.has(templateId),
      review: existingReviews.find((r) => r.templateId === templateId) || null,
    }));

    return { data: result };
  }

  async create(dto: CreateTestimonialDto) {
    // Enforce one review per user per template
    if (dto.userId && dto.templateId) {
      const existing = await this.prisma.testimonial.findUnique({
        where: {
          userId_templateId: {
            userId: dto.userId,
            templateId: dto.templateId,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Anda sudah memberikan ulasan untuk template ini');
      }
    }

    // Verify template exists
    if (dto.templateId) {
      const template = await this.prisma.template.findUnique({
        where: { id: dto.templateId },
      });
      if (!template) throw new NotFoundException('Template tidak ditemukan');
    }

    const testimonial = await this.prisma.testimonial.create({
      data: { ...dto, isApproved: false },
    });

    // Recalculate template ratingAvg
    if (dto.templateId) {
      await this.recalculateTemplateRating(dto.templateId);
    }

    // Notify admins about new testimonial
    await this.notificationsService.notifyAdmins({
      type: 'TESTIMONIAL_NEW',
      title: 'Testimoni Baru',
      message: `${dto.userName} memberikan ulasan baru. Menunggu persetujuan.`,
      linkUrl: '/dashboard/testimonials',
    });

    return testimonial;
  }

  async approve(id: string, isApproved: boolean) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw new NotFoundException('Testimonial not found');

    const updated = await this.prisma.testimonial.update({
      where: { id },
      data: { isApproved },
    });

    // Recalculate template rating when approval status changes
    if (testimonial.templateId) {
      await this.recalculateTemplateRating(testimonial.templateId);
    }

    return updated;
  }

  async remove(id: string) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw new NotFoundException('Testimonial not found');

    await this.prisma.testimonial.delete({ where: { id } });

    // Recalculate template rating after deletion
    if (testimonial.templateId) {
      await this.recalculateTemplateRating(testimonial.templateId);
    }

    return { message: 'Testimonial deleted' };
  }

  /**
   * Recalculate ratingAvg and ratingCount for a template
   * based on all testimonials (approved or not) for that template.
   */
  private async recalculateTemplateRating(templateId: string) {
    const aggregate = await this.prisma.testimonial.aggregate({
      where: { templateId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await this.prisma.template.update({
      where: { id: templateId },
      data: {
        ratingAvg: aggregate._avg.rating || 0,
        ratingCount: aggregate._count.id || 0,
      },
    });
  }
}
