import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: (port || 587) === 465,
        auth: { user, pass },
      });
      this.logger.log(`Mailer configured with host ${host}`);
    } else {
      this.logger.warn('SMTP not configured — emails will be logged to console');
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM') || this.configService.get<string>('SMTP_USER') || 'noreply@invitee.id';

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html });
        this.logger.log(`Email sent to ${to}: ${subject}`);
      } catch (error) {
        this.logger.error(`Failed to send email to ${to}: ${error}`);
        throw error;
      }
    } else {
      // Fallback: log to console in development
      this.logger.warn(`[DEV] Email to ${to} | Subject: ${subject}`);
      this.logger.warn(`[DEV] Body:\n${html}`);
    }
  }

  /** Send email verification link */
  async sendVerificationEmail(to: string, fullName: string, token: string, baseUrl: string): Promise<void> {
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#ea580c,#f97316);padding:32px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:24px;margin:0;">💌 Invitee</h1>
      <p style="color:#fed7aa;font-size:13px;margin:8px 0 0;">Platform Undangan Digital Indonesia</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 24px;">
      <h2 style="color:#18181b;font-size:20px;margin:0 0 8px;">Verifikasi Email Anda</h2>
      <p style="color:#71717a;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Halo <strong>${fullName}</strong>,<br><br>
        Terima kasih telah mendaftar di Invitee! Klik tombol di bawah untuk memverifikasi alamat email Anda dan mulai membuat undangan digital.
      </p>

      <div style="text-align:center;margin:24px 0;">
        <a href="${verifyUrl}" style="display:inline-block;background:#ea580c;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
          Verifikasi Email Saya
        </a>
      </div>

      <p style="color:#a1a1aa;font-size:12px;line-height:1.6;margin:24px 0 0;">
        Atau salin link berikut ke browser Anda:<br>
        <a href="${verifyUrl}" style="color:#ea580c;word-break:break-all;">${verifyUrl}</a>
      </p>

      <p style="color:#a1a1aa;font-size:12px;margin:16px 0 0;">
        Link ini berlaku selama <strong>24 jam</strong>. Jika Anda tidak mendaftar di Invitee, abaikan email ini.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#fafafa;padding:16px 24px;text-align:center;border-top:1px solid #f4f4f5;">
      <p style="color:#a1a1aa;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Invitee. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    await this.sendMail(to, 'Verifikasi Email Anda — Invitee', html);
  }
}
