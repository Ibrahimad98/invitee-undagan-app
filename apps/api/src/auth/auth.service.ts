import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { MailerService } from '../mailer/mailer.service';
import { STORAGE_SERVICE, IStorageService } from '../storage/storage.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private settingsService: SettingsService,
    private mailerService: MailerService,
    @Inject(STORAGE_SERVICE) private storageService: IStorageService,
  ) {}

  /** Resolve avatarUrl to a full URL if it's a storage key */
  private async resolveAvatarUrl(user: any): Promise<any> {
    if (!user || !user.avatarUrl) return user;
    if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://') || user.avatarUrl.startsWith('/uploads/')) {
      return user;
    }
    return { ...user, avatarUrl: await this.storageService.getUrl(user.avatarUrl) };
  }

  /** Check if email verification is enabled in settings */
  private async isEmailVerificationEnabled(): Promise<boolean> {
    const settings = await this.settingsService.findPublic('registration');
    return settings.some(
      (s: any) =>
        s.item.toLowerCase().includes('email') &&
        s.item.toLowerCase().includes('verif') &&
        s.value.toLowerCase() === 'true',
    );
  }

  /** Generate a secure random token */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async register(dto: RegisterDto & { baseUrl?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing && !existing.isDeleted) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const emailVerificationEnabled = await this.isEmailVerificationEnabled();

    // Generate verification token if email verification is enabled
    const verifyToken = emailVerificationEnabled ? this.generateToken() : null;
    const verifyExpires = emailVerificationEnabled
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      : null;

    // During beta, all self-registered users are BASIC with 300 guest limit
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        subscriptionType: 'BASIC',
        maxGuests: 300,
        isFirstLogin: true,
        isEmailVerified: !emailVerificationEnabled, // auto-verified if feature disabled
        emailVerifyToken: verifyToken,
        emailVerifyExpires: verifyExpires,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    // If email verification is enabled, send verification email
    if (emailVerificationEnabled && verifyToken) {
      const baseUrl = dto.baseUrl || this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      await this.mailerService.sendVerificationEmail(
        user.email,
        user.fullName,
        verifyToken,
        baseUrl,
      );

      return {
        needsVerification: true,
        message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.',
        email: user.email,
      };
    }

    // If verification is disabled, return JWT directly
    return {
      needsVerification: false,
      accessToken: this.generateJwtToken(user.id, user.email),
      user: await this.resolveAvatarUrl(userWithoutPassword),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Check email verification if enabled
    const emailVerificationEnabled = await this.isEmailVerificationEnabled();
    if (emailVerificationEnabled && !user.isEmailVerified) {
      throw new ForbiddenException('Email belum diverifikasi. Silakan cek inbox email Anda.');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      accessToken: this.generateJwtToken(user.id, user.email),
      user: await this.resolveAvatarUrl(userWithoutPassword),
    };
  }

  /** Mark the user's first login as completed */
  async markFirstLoginComplete(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isFirstLogin: false },
    });
    return { success: true };
  }

  async verifyPassword(userId: string, currentPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      throw new BadRequestException('Password saat ini tidak benar');
    }

    return { verified: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Password saat ini tidak benar');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Password berhasil diubah' };
  }

  /** Login or register via Google OAuth */
  async googleLogin(googleToken: string) {
    // Verify Google token by calling Google's tokeninfo endpoint
    let googleUser: { email: string; name: string; picture?: string; email_verified?: boolean };
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${googleToken}` },
      });
      if (!response.ok) throw new Error('Invalid token');
      googleUser = await response.json();
    } catch {
      throw new UnauthorizedException('Token Google tidak valid');
    }

    if (!googleUser.email) {
      throw new BadRequestException('Tidak bisa mendapatkan email dari akun Google');
    }

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user && user.isDeleted) {
      throw new UnauthorizedException('Akun ini telah dihapus');
    }

    if (!user) {
      // Create new user from Google data
      const randomPassword = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          passwordHash,
          fullName: googleUser.name || googleUser.email.split('@')[0],
          avatarUrl: googleUser.picture || null,
          subscriptionType: 'BASIC',
          maxGuests: 300,
          isFirstLogin: true,
          isEmailVerified: true, // Google-authenticated emails are pre-verified
        },
      });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      accessToken: this.generateJwtToken(user.id, user.email),
      user: await this.resolveAvatarUrl(userWithoutPassword),
    };
  }

  /** Verify email with token */
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new BadRequestException('Token verifikasi tidak valid');
    }

    if (user.isEmailVerified) {
      return { message: 'Email sudah diverifikasi sebelumnya', alreadyVerified: true };
    }

    if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
      throw new BadRequestException('Token verifikasi sudah kadaluarsa. Silakan minta kirim ulang.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      message: 'Email berhasil diverifikasi!',
      accessToken: this.generateJwtToken(user.id, user.email),
      user: await this.resolveAvatarUrl({ ...userWithoutPassword, isEmailVerified: true }),
    };
  }

  /** Resend verification email */
  async resendVerification(email: string, baseUrl?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.isDeleted) {
      // Don't reveal whether email exists
      return { message: 'Jika email terdaftar, email verifikasi akan dikirim.' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email sudah terverifikasi. Silakan login.');
    }

    // Generate new token
    const verifyToken = this.generateToken();
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: verifyToken,
        emailVerifyExpires: verifyExpires,
      },
    });

    const resolvedBaseUrl = baseUrl || this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    await this.mailerService.sendVerificationEmail(user.email, user.fullName, verifyToken, resolvedBaseUrl);

    return { message: 'Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.' };
  }

  private generateJwtToken(userId: string, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}
