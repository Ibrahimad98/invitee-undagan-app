import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  private readonly includeRelations = {
    events: { orderBy: { sortOrder: 'asc' as const } },
    personProfiles: { orderBy: { sortOrder: 'asc' as const } },
    giftAccounts: { orderBy: { sortOrder: 'asc' as const } },
    coInvitors: { orderBy: { sortOrder: 'asc' as const } },
    media: { orderBy: { sortOrder: 'asc' as const } },
    templates: {
      include: { template: true },
    },
  };

  async findAllByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [invitations, total] = await Promise.all([
      this.prisma.invitation.findMany({
        where: { userId },
        include: this.includeRelations,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invitation.count({ where: { userId } }),
    ]);

    return {
      data: invitations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      include: {
        ...this.includeRelations,
        guests: true,
        rsvps: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.userId !== userId) throw new ForbiddenException('Not your invitation');

    return invitation;
  }

  async findBySlugPublic(slug: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { slug },
      include: this.includeRelations,
    });

    if (!invitation) throw new NotFoundException('Invitation not found');

    // Increment view count
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { viewCount: { increment: 1 } },
    });

    return invitation;
  }

  async create(userId: string, dto: CreateInvitationDto) {
    const { events, personProfiles, giftAccounts, coInvitors, templateId, ...invitationData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const invitation = await tx.invitation.create({
        data: {
          ...invitationData,
          eventType: invitationData.eventType as any,
          userId,
          events: events?.length
            ? { createMany: { data: events.map((e, i) => ({ ...e, sortOrder: e.sortOrder ?? i })) } }
            : undefined,
          personProfiles: personProfiles?.length
            ? { createMany: { data: personProfiles.map((p, i) => ({ ...p, sortOrder: p.sortOrder ?? i })) } }
            : undefined,
          giftAccounts: giftAccounts?.length
            ? { createMany: { data: giftAccounts.map((g, i) => ({ ...g, sortOrder: g.sortOrder ?? i })) } }
            : undefined,
          coInvitors: coInvitors?.length
            ? { createMany: { data: coInvitors.map((c, i) => ({ ...c, sortOrder: c.sortOrder ?? i })) } }
            : undefined,
        },
        include: this.includeRelations,
      });

      if (templateId) {
        await tx.invitationTemplate.create({
          data: {
            invitationId: invitation.id,
            templateId,
            isPrimary: true,
          },
        });

        await tx.template.update({
          where: { id: templateId },
          data: { usageCount: { increment: 1 } },
        });
      }

      return this.prisma.invitation.findUnique({
        where: { id: invitation.id },
        include: this.includeRelations,
      });
    });
  }

  async update(id: string, userId: string, dto: UpdateInvitationDto) {
    const existing = await this.prisma.invitation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Invitation not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not your invitation');

    const { events, personProfiles, giftAccounts, coInvitors, templateId, ...updateData } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Update basic invitation data
      await tx.invitation.update({
        where: { id },
        data: {
          ...updateData,
          eventType: updateData.eventType as any,
        },
      });

      // Replace events if provided
      if (events) {
        await tx.invitationEvent.deleteMany({ where: { invitationId: id } });
        if (events.length > 0) {
          await tx.invitationEvent.createMany({
            data: events.map((e, i) => ({ ...e, invitationId: id, sortOrder: e.sortOrder ?? i })),
          });
        }
      }

      // Replace person profiles if provided
      if (personProfiles) {
        await tx.personProfile.deleteMany({ where: { invitationId: id } });
        if (personProfiles.length > 0) {
          await tx.personProfile.createMany({
            data: personProfiles.map((p, i) => ({ ...p, invitationId: id, sortOrder: p.sortOrder ?? i })),
          });
        }
      }

      // Replace gift accounts if provided
      if (giftAccounts) {
        await tx.giftAccount.deleteMany({ where: { invitationId: id } });
        if (giftAccounts.length > 0) {
          await tx.giftAccount.createMany({
            data: giftAccounts.map((g, i) => ({ ...g, invitationId: id, sortOrder: g.sortOrder ?? i })),
          });
        }
      }

      // Replace co-invitors if provided
      if (coInvitors) {
        await tx.coInvitor.deleteMany({ where: { invitationId: id } });
        if (coInvitors.length > 0) {
          await tx.coInvitor.createMany({
            data: coInvitors.map((c, i) => ({ ...c, invitationId: id, sortOrder: c.sortOrder ?? i })),
          });
        }
      }

      // Update template if provided
      if (templateId) {
        await tx.invitationTemplate.deleteMany({ where: { invitationId: id } });
        await tx.invitationTemplate.create({
          data: { invitationId: id, templateId, isPrimary: true },
        });
      }

      return tx.invitation.findUnique({
        where: { id },
        include: this.includeRelations,
      });
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.invitation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Invitation not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not your invitation');

    await this.prisma.invitation.delete({ where: { id } });
    return { message: 'Invitation deleted successfully' };
  }

  async getDashboardStats(userId: string) {
    const [totalInvitations, invitations, rsvpStats, recentInvitations] = await Promise.all([
      this.prisma.invitation.count({ where: { userId } }),
      this.prisma.invitation.findMany({
        where: { userId },
        select: { viewCount: true },
      }),
      this.prisma.rsvp.groupBy({
        by: ['attendance'],
        where: { invitation: { userId } },
        _count: true,
      }),
      this.prisma.invitation.findMany({
        where: { userId },
        include: this.includeRelations,
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalViews = invitations.reduce((sum, inv) => sum + inv.viewCount, 0);
    const totalRsvps = rsvpStats.reduce((sum, stat) => sum + stat._count, 0);

    const getCount = (status: string) =>
      rsvpStats.find((s) => s.attendance === status)?._count ?? 0;

    return {
      totalInvitations,
      totalViews,
      totalRsvps,
      attendingCount: getCount('ATTENDING'),
      notAttendingCount: getCount('NOT_ATTENDING'),
      pendingCount: getCount('PENDING') + getCount('MAYBE'),
      recentInvitations,
    };
  }
}
