import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;
  let prisma: any;

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
      googleLogin: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerification: vi.fn(),
      markFirstLoginComplete: vi.fn(),
      verifyPassword: vi.fn(),
      changePassword: vi.fn(),
    };

    prisma = {
      siteSetting: {
        findFirst: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = { email: 'test@example.com', password: 'pass123', fullName: 'Test' };
      authService.register.mockResolvedValue({ needsVerification: false, accessToken: 'token' });

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result.accessToken).toBe('token');
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const dto = { email: 'test@example.com', password: 'pass123' };
      authService.login.mockResolvedValue({ accessToken: 'token', user: {} });

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result.accessToken).toBe('token');
    });
  });

  describe('verifyEmail', () => {
    it('should call authService.verifyEmail', async () => {
      authService.verifyEmail.mockResolvedValue({ message: 'Verified' });

      const result = await controller.verifyEmail('valid-token');

      expect(authService.verifyEmail).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('resendVerification', () => {
    it('should call authService.resendVerification', async () => {
      authService.resendVerification.mockResolvedValue({ message: 'Sent' });

      const result = await controller.resendVerification({ email: 'test@example.com' });

      expect(authService.resendVerification).toHaveBeenCalledWith('test@example.com', undefined);
    });
  });

  describe('getBetaConfig', () => {
    it('should return beta config from settings', async () => {
      prisma.siteSetting.findFirst
        .mockResolvedValueOnce({ value: 'true' }) // isBeta
        .mockResolvedValueOnce({ value: '500' }); // maxGuests

      const result = await controller.getBetaConfig();

      expect(result.isBeta).toBe(true);
      expect(result.defaultMaxGuests).toBe(500);
    });

    it('should return defaults when no settings found', async () => {
      prisma.siteSetting.findFirst.mockResolvedValue(null);

      const result = await controller.getBetaConfig();

      expect(result.isBeta).toBe(false);
      expect(result.defaultMaxGuests).toBe(300);
    });
  });

  describe('firstLoginComplete', () => {
    it('should call authService.markFirstLoginComplete', async () => {
      authService.markFirstLoginComplete.mockResolvedValue({ success: true });

      const result = await controller.firstLoginComplete('user-1');

      expect(authService.markFirstLoginComplete).toHaveBeenCalledWith('user-1');
      expect(result.success).toBe(true);
    });
  });
});
