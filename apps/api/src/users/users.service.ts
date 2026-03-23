import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { STORAGE_SERVICE, IStorageService } from '../storage/storage.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    @Inject(STORAGE_SERVICE) private storageService: IStorageService,
  ) {}

  /** Resolve avatarUrl to a full URL if it's a storage key */
  private async resolveAvatarUrl(user: any): Promise<any> {
    if (!user || !user.avatarUrl) return user;
    // If it already looks like a full URL, skip
    if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://') || user.avatarUrl.startsWith('/uploads/')) {
      return user;
    }
    return { ...user, avatarUrl: await this.storageService.getUrl(user.avatarUrl) };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, isDeleted: false },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...result } = user;
    return this.resolveAvatarUrl(result);
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: any = { ...dto };
    // Convert dateOfBirth string to Date object for Prisma
    if (dto.dateOfBirth) {
      data.dateOfBirth = new Date(dto.dateOfBirth);
    }

    // If phone number changes, reset WhatsApp verification
    if (dto.phone !== undefined) {
      const existing = await this.prisma.user.findUnique({ where: { id } });
      if (existing && existing.phone !== dto.phone) {
        data.isWhatsappVerified = false;
        data.whatsappOtp = null;
        data.whatsappOtpExpires = null;
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    const { passwordHash, ...result } = user;
    return this.resolveAvatarUrl(result);
  }

  async findAll(search?: string) {
    const where: any = { isDeleted: false };
    if (search && search.trim()) {
      where.OR = [
        { fullName: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { phone: { contains: search.trim() } },
      ];
    }
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    const usersWithoutPassword = users.map(({ passwordHash, ...rest }) => rest);
    return {
      data: await Promise.all(usersWithoutPassword.map((u) => this.resolveAvatarUrl(u))),
    };
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id, isDeleted: false },
    });
    if (!existing) throw new NotFoundException('User not found');

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.role !== undefined && { role: dto.role as any }),
        ...(dto.subscriptionType !== undefined && { subscriptionType: dto.subscriptionType as any }),
        ...(dto.maxGuests !== undefined && { maxGuests: dto.maxGuests }),
        ...(dto.subscriptionExpireDate !== undefined && {
          subscriptionExpireDate: new Date(dto.subscriptionExpireDate),
        }),
      },
    });
    const { passwordHash, ...result } = user;
    return this.resolveAvatarUrl(result);
  }

  /** Admin creates a FAST_SERVE user with auto-generated credentials */
  async createFastServeUser(dto: { fullName: string; phone?: string; email?: string }) {
    // Generate a unique email if none provided
    const email = dto.email || `fs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@invitee.local`;

    // Check existing
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email sudah terdaftar');

    // Generate random password (8 chars, alphanumeric)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let plainPassword = '';
    for (let i = 0; i < 8; i++) {
      plainPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const passwordHash = await bcrypt.hash(plainPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        subscriptionType: 'FAST_SERVE',
        maxGuests: 300,
        isFirstLogin: true,
        subscriptionExpireDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    // Return plain password so admin can share it (only returned once)
    return {
      ...userWithoutPassword,
      generatedPassword: plainPassword,
    };
  }

  /** Get all pending guest limit requests */
  async findGuestLimitRequests(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const requests = await this.prisma.guestLimitRequest.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, subscriptionType: true, maxGuests: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: requests };
  }

  /** User submits a guest limit increase request */
  async requestGuestLimitIncrease(userId: string, dto: { requestedAmount: number; reason?: string; invitationId?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check if already has a pending request
    const existingPending = await this.prisma.guestLimitRequest.findFirst({
      where: { userId, status: 'PENDING' },
    });
    if (existingPending) {
      throw new BadRequestException('Anda masih memiliki permintaan yang sedang diproses. Silakan tunggu persetujuan admin.');
    }

    return this.prisma.guestLimitRequest.create({
      data: {
        userId,
        invitationId: dto.invitationId,
        currentLimit: user.maxGuests,
        requestedAmount: dto.requestedAmount,
        reason: dto.reason,
      },
    }).then(async (request) => {
      // Notify admins about the new request
      await this.notificationsService.notifyAdmins({
        type: 'PREMIUM_REQUEST',
        title: 'Permintaan Akses Premium',
        message: `${user.fullName} (${user.email}) mengajukan request akses fitur Premium. Alasan: ${dto.reason || '-'}`,
        linkUrl: '/dashboard/users',
      });
      return request;
    });
  }

  /** Admin approves a guest limit request */
  async approveGuestLimitRequest(requestId: string, adminNote?: string) {
    const request = await this.prisma.guestLimitRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('Request sudah diproses');

    // Update the request status and upgrade user to PREMIUM with 2000 guests
    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.guestLimitRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', adminNote },
      }),
      this.prisma.user.update({
        where: { id: request.userId },
        data: {
          subscriptionType: 'PREMIUM',
          maxGuests: 2000,
          subscriptionExpireDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Notify user about approval
    await this.notificationsService.create({
      userId: request.userId,
      type: 'REQUEST_APPROVED',
      title: 'Akses Premium Disetujui! 🎉',
      message: `Selamat! Permintaan akses Premium Anda telah disetujui. Anda sekarang memiliki akses ke semua fitur Premium dengan kuota 2000 tamu.${adminNote ? ` Catatan: ${adminNote}` : ''}`,
      linkUrl: '/dashboard/subscription',
    });

    return updatedRequest;
  }

  /** Admin rejects a guest limit request */
  async rejectGuestLimitRequest(requestId: string, adminNote?: string) {
    const request = await this.prisma.guestLimitRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('Request sudah diproses');

    const updated = await this.prisma.guestLimitRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', adminNote },
    });

    // Notify user about rejection
    await this.notificationsService.create({
      userId: request.userId,
      type: 'REQUEST_REJECTED',
      title: 'Permintaan Premium Ditolak',
      message: `Permintaan akses Premium Anda belum dapat disetujui saat ini.${adminNote ? ` Alasan: ${adminNote}` : ''} Silakan coba lagi nanti.`,
      linkUrl: '/dashboard/subscription',
    });

    return updated;
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id, isDeleted: false },
    });
    if (!existing) throw new NotFoundException('User not found');

    // Soft delete: set isDeleted flag and deletedAt timestamp
    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return { message: 'Pengguna berhasil dihapus' };
  }

  // ─── WhatsApp Verification ───

  async requestWhatsappOtp(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.phone) throw new BadRequestException('Nomor telepon belum diisi. Silakan lengkapi profil terlebih dahulu.');
    if (user.isWhatsappVerified) throw new BadRequestException('Nomor WhatsApp sudah terverifikasi.');

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.user.update({
      where: { id: userId },
      data: { whatsappOtp: otp, whatsappOtpExpires: expires },
    });

    // Format phone for WhatsApp link
    let cleaned = user.phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.substring(1);
    if (!cleaned.startsWith('62') && cleaned.length <= 12) cleaned = '62' + cleaned;

    const message = `[Invitee] Kode verifikasi WhatsApp Anda: *${otp}*\n\nKode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.`;
    const waUrl = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`;

    return {
      message: 'Kode OTP berhasil dibuat. Kirim kode melalui WhatsApp untuk verifikasi.',
      waUrl,
      phone: user.phone,
      expiresAt: expires.toISOString(),
    };
  }

  async confirmWhatsappOtp(userId: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isWhatsappVerified) throw new BadRequestException('Nomor WhatsApp sudah terverifikasi.');
    if (!user.whatsappOtp || !user.whatsappOtpExpires) {
      throw new BadRequestException('Belum ada kode OTP. Silakan minta kode terlebih dahulu.');
    }
    if (new Date() > user.whatsappOtpExpires) {
      throw new BadRequestException('Kode OTP sudah kedaluwarsa. Silakan minta kode baru.');
    }
    if (user.whatsappOtp !== otp) {
      throw new BadRequestException('Kode OTP tidak valid.');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isWhatsappVerified: true,
        whatsappOtp: null,
        whatsappOtpExpires: null,
      },
    });

    const { passwordHash, ...result } = updated;
    return {
      message: 'Nomor WhatsApp berhasil diverifikasi! ✅',
      user: await this.resolveAvatarUrl(result),
    };
  }
}
