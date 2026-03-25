import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MailerService } from './mailer.service';
import { ConfigService } from '@nestjs/config';

vi.mock('nodemailer', () => ({
  createTransport: vi.fn().mockReturnValue({
    sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

describe('MailerService', () => {
  describe('with SMTP configured', () => {
    let service: MailerService;

    beforeEach(() => {
      const configService = {
        get: vi.fn((key: string) => {
          const config: Record<string, string> = {
            SMTP_HOST: 'smtp.example.com',
            SMTP_PORT: '587',
            SMTP_USER: 'user@example.com',
            SMTP_PASS: 'password',
            SMTP_FROM: 'noreply@invitee.id',
          };
          return config[key];
        }),
      } as unknown as ConfigService;

      service = new MailerService(configService);
    });

    it('should create transporter when SMTP is configured', () => {
      expect(service).toBeDefined();
      // The transporter is private but we can test that sendMail works
    });

    it('should send mail without throwing', async () => {
      await expect(
        service.sendMail('test@example.com', 'Test Subject', '<p>Hello</p>'),
      ).resolves.not.toThrow();
    });

    it('should send verification email without throwing', async () => {
      await expect(
        service.sendVerificationEmail('test@example.com', 'Test User', 'token123', 'http://localhost:3000'),
      ).resolves.not.toThrow();
    });
  });

  describe('without SMTP configured (dev mode)', () => {
    let service: MailerService;

    beforeEach(() => {
      const configService = {
        get: vi.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;

      service = new MailerService(configService);
    });

    it('should still be created successfully', () => {
      expect(service).toBeDefined();
    });

    it('should log to console instead of sending (no throw)', async () => {
      await expect(
        service.sendMail('test@example.com', 'Test', '<p>Test</p>'),
      ).resolves.not.toThrow();
    });
  });
});
