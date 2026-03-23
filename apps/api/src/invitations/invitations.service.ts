import { Injectable, NotFoundException, ForbiddenException, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_SERVICE, IStorageService } from '../storage/storage.interface';
import { SettingsService } from '../settings/settings.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private storageService: IStorageService,
    private settingsService: SettingsService,
  ) {}

  /**
   * Resolve media fileUrl paths to full URLs (presigned for S3, direct for local).
   * Also resolves personProfile photoUrl if it's a stored path.
   */
  private async resolveUrls<T extends Record<string, any>>(invitation: T | null): Promise<T | null> {
    if (!invitation) return invitation;
    const result: any = { ...invitation };

    // Resolve media URLs
    if (result.media && Array.isArray(result.media)) {
      result.media = await Promise.all(
        result.media.map(async (m: any) => ({
          ...m,
          fileUrl: m.fileUrl && !m.fileUrl.startsWith('http') && !m.fileUrl.startsWith('/')
            ? await this.storageService.getUrl(m.fileUrl)
            : m.fileUrl,
        })),
      );
    }

    // Resolve person profile photo URLs
    if (result.personProfiles && Array.isArray(result.personProfiles)) {
      result.personProfiles = await Promise.all(
        result.personProfiles.map(async (p: any) => ({
          ...p,
          photoUrl: p.photoUrl && !p.photoUrl.startsWith('http') && !p.photoUrl.startsWith('/')
            ? await this.storageService.getUrl(p.photoUrl)
            : p.photoUrl,
        })),
      );
    }

    return result as T;
  }

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
      data: await Promise.all(invitations.map((inv) => this.resolveUrls(inv))),
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

    return await this.resolveUrls(invitation);
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

    return await this.resolveUrls(invitation);
  }

  /**
   * Enforce invitation creation limit based on beta mode + subscription tier.
   * When beta_mode is active the limits come from system settings:
   *   - BASIC:      beta_max_invitations_basic       (default 1)
   *   - PREMIUM:    beta_max_invitations_premium      (default 3)
   *   - FAST_SERVE: beta_max_invitations_enterprise   (default 1, 0 = unlimited)
   * When beta_mode is OFF there is no global limit enforced here.
   */
  private async enforceInvitationLimit(userId: string, subscriptionType: string) {
    const isBeta = (await this.settingsService.getSystemValue('beta_mode')) === 'true';
    if (!isBeta) return;

    const TIER_SETTING_MAP: Record<string, { key: string; fallback: number }> = {
      BASIC:      { key: 'beta_max_invitations_basic',      fallback: 1 },
      PREMIUM:    { key: 'beta_max_invitations_premium',    fallback: 3 },
      FAST_SERVE: { key: 'beta_max_invitations_enterprise', fallback: 1 },
    };

    const tier = TIER_SETTING_MAP[subscriptionType] ?? TIER_SETTING_MAP.BASIC;
    const raw = await this.settingsService.getSystemValue(tier.key);
    const maxInvitations = parseInt(raw || String(tier.fallback), 10);

    // 0 means unlimited
    if (maxInvitations <= 0) return;

    const existingCount = await this.prisma.invitation.count({ where: { userId } });
    if (existingCount >= maxInvitations) {
      const TIER_LABELS: Record<string, string> = {
        BASIC: 'Basic',
        PREMIUM: 'Premium',
        FAST_SERVE: 'Enterprise',
      };
      const tierLabel = TIER_LABELS[subscriptionType] ?? subscriptionType;
      throw new BadRequestException(
        `Batas undangan tercapai. Akun ${tierLabel} (beta) maksimal ${maxInvitations} undangan. Hubungi admin untuk upgrade.`,
      );
    }
  }

  async create(userId: string, dto: CreateInvitationDto) {
    const { events, personProfiles, giftAccounts, coInvitors, templateId, ...invitationData } = dto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    // Check subscription expiry for FAST_SERVE
    if (user.subscriptionType === 'FAST_SERVE') {
      if (user.subscriptionExpireDate && new Date() > new Date(user.subscriptionExpireDate)) {
        throw new BadRequestException('Masa aktif akun Enterprise Anda telah habis (90 hari). Silakan hubungi admin.');
      }
    }

    // Enforce invitation limit based on beta mode + subscription tier
    await this.enforceInvitationLimit(userId, user.subscriptionType);

    const txResult = await this.prisma.$transaction(async (tx) => {
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

      const result = await this.prisma.invitation.findUnique({
        where: { id: invitation.id },
        include: this.includeRelations,
      });

      return result;
    });

    return await this.resolveUrls(txResult);
  }

  async update(id: string, userId: string, dto: UpdateInvitationDto) {
    const existing = await this.prisma.invitation.findUnique({
      where: { id },
      include: {
        events: true,
        personProfiles: true,
        templates: true,
      },
    });
    if (!existing) throw new NotFoundException('Invitation not found');
    if (existing.userId !== userId) throw new ForbiddenException('Not your invitation');

    // Validate completeness when publishing
    if (dto.isPublished === true && !existing.isPublished) {
      const missingFields: string[] = [];

      if (!existing.title) missingFields.push('Judul undangan');
      if (!existing.slug) missingFields.push('Slug/URL undangan');
      if (!existing.eventType) missingFields.push('Tipe acara');

      const eventsToCheck = dto.events ?? existing.events;
      const profilesToCheck = dto.personProfiles ?? existing.personProfiles;
      const templateToCheck = dto.templateId ?? (existing.templates?.length ? existing.templates[0].templateId : null);

      if (!eventsToCheck || eventsToCheck.length === 0) {
        missingFields.push('Minimal 1 acara');
      } else {
        const hasValidEvent = eventsToCheck.some(
          (e: any) => e.eventName?.trim() && e.eventDate,
        );
        if (!hasValidEvent) missingFields.push('Acara harus memiliki nama dan tanggal');
      }

      if (!profilesToCheck || profilesToCheck.length === 0) {
        missingFields.push('Minimal 1 profil (mempelai/yang berulang tahun)');
      } else {
        const hasValidProfile = profilesToCheck.some(
          (p: any) => p.fullName?.trim(),
        );
        if (!hasValidProfile) missingFields.push('Profil harus memiliki nama lengkap');
      }

      if (!templateToCheck) {
        missingFields.push('Template undangan');
      }

      if (missingFields.length > 0) {
        throw new BadRequestException(
          `Tidak bisa publish, data belum lengkap: ${missingFields.join(', ')}`,
        );
      }
    }

    const { events, personProfiles, giftAccounts, coInvitors, templateId, ...updateData } = dto;

    const txResult = await this.prisma.$transaction(async (tx) => {
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

      const result = await tx.invitation.findUnique({
        where: { id },
        include: this.includeRelations,
      });

      return result;
    });

    return await this.resolveUrls(txResult);
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
      recentInvitations: await Promise.all(recentInvitations.map((inv) => this.resolveUrls(inv))),
    };
  }

  /** Export invitation guest data as an Excel workbook buffer (PREMIUM/FAST_SERVE feature) */
  async exportToExcel(userId: string, invitationId?: string, baseUrl?: string): Promise<Buffer> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.subscriptionType !== 'PREMIUM' && user.subscriptionType !== 'FAST_SERVE' && user.role !== 'ADMIN')) {
      throw new ForbiddenException('Fitur export Excel hanya tersedia untuk pengguna Premium/Enterprise.');
    }

    if (!invitationId) {
      throw new BadRequestException('Pilih undangan terlebih dahulu sebelum export.');
    }

    const siteUrl = baseUrl || 'http://localhost:3000';

    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId },
      include: {
        events: { orderBy: { sortOrder: 'asc' } },
        guests: {
          include: { rsvps: true },
          orderBy: { createdAt: 'asc' },
        },
        rsvps: true,
        templates: { include: { template: true } },
        user: { select: { fullName: true, email: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Undangan tidak ditemukan.');
    }

    const templateSlug = invitation.templates?.[0]?.template?.slug || 'default';
    const firstEvent = invitation.events?.[0];

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Rekap Undangan');

    // ── Top section: Invitation info ──
    const headerStyle = { bold: true, size: 11 } as any;
    const infoRows = [
      ['Judul Undangan', invitation.title],
      ['Jenis Acara', invitation.eventType],
      ['Link Undangan', `${siteUrl}/${invitation.slug}/${templateSlug}`],
      ['Status', invitation.isPublished ? 'Published' : 'Draft'],
      ['Tanggal Acara', firstEvent?.eventDate || '-'],
      ['Waktu', `${firstEvent?.startTime || '-'} - ${firstEvent?.endTime || '-'}`],
      ['Lokasi', firstEvent?.venueName || '-'],
      ['Alamat', firstEvent?.venueAddress || '-'],
      ['Pemilik', `${invitation.user?.fullName} (${invitation.user?.email})`],
      ['Total Dilihat', String(invitation.viewCount)],
    ];

    infoRows.forEach(([label, value]) => {
      const row = sheet.addRow([label, value]);
      row.getCell(1).font = headerStyle;
    });

    // Empty row separator
    sheet.addRow([]);

    // ── Guest table section ──
    const tableHeaderRow = sheet.addRow([
      'No', 'Nama Tamu', 'No HP', 'Link Personal', 'RSVP', 'Kehadiran', 'Status Kirim', 'Dikirim Via',
    ]);
    tableHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    tableHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

    // Set column widths
    sheet.getColumn(1).width = 5;
    sheet.getColumn(2).width = 25;
    sheet.getColumn(3).width = 18;
    sheet.getColumn(4).width = 55;
    sheet.getColumn(5).width = 15;
    sheet.getColumn(6).width = 15;
    sheet.getColumn(7).width = 15;
    sheet.getColumn(8).width = 12;

    const ATTENDANCE_MAP: Record<string, string> = {
      ATTENDING: 'Hadir',
      NOT_ATTENDING: 'Tidak Hadir',
      MAYBE: 'Mungkin',
      PENDING: 'Belum Respon',
    };

    invitation.guests.forEach((guest: any, idx: number) => {
      const guestLink = `${siteUrl}/${invitation.slug}/${templateSlug}?kpd=${encodeURIComponent(guest.name)}`;
      // Find RSVP for this guest
      const rsvp = invitation.rsvps.find((r: any) => r.guestId === guest.id);
      const attendance = rsvp?.attendance || 'PENDING';

      sheet.addRow([
        idx + 1,
        guest.name,
        guest.phone || '-',
        guestLink,
        rsvp ? 'Sudah RSVP' : 'Belum RSVP',
        ATTENDANCE_MAP[attendance] || attendance,
        guest.isSent ? 'Terkirim' : 'Belum',
        guest.sentVia || '-',
      ]);
    });

    // Summary row
    sheet.addRow([]);
    const totalGuests = invitation.guests.length;
    const attending = invitation.rsvps.filter((r: any) => r.attendance === 'ATTENDING').length;
    const notAttending = invitation.rsvps.filter((r: any) => r.attendance === 'NOT_ATTENDING').length;
    const sentCount = invitation.guests.filter((g: any) => g.isSent).length;

    const summaryRows = [
      ['Total Tamu', String(totalGuests)],
      ['Terkirim', String(sentCount)],
      ['Hadir', String(attending)],
      ['Tidak Hadir', String(notAttending)],
    ];
    summaryRows.forEach(([label, value]) => {
      const row = sheet.addRow([label, value]);
      row.getCell(1).font = headerStyle;
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
