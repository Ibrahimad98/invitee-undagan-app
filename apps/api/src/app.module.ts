import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import * as path from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InvitationsModule } from './invitations/invitations.module';
import { TemplatesModule } from './templates/templates.module';
import { GuestsModule } from './guests/guests.module';
import { RsvpModule } from './rsvp/rsvp.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { MediaModule } from './media/media.module';
import { CommentsModule } from './comments/comments.module';
import { SettingsModule } from './settings/settings.module';
import { AssetsModule } from './assets/assets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BugFeedbackModule } from './bug-feedback/bug-feedback.module';
import { MailerModule } from './mailer/mailer.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '../../.env'),
      ],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('1d'),
        STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
        STORAGE_LOCAL_PATH: Joi.string().default('./uploads'),
        S3_BUCKET: Joi.when('STORAGE_DRIVER', {
          is: 's3',
          then: Joi.string().required(),
          otherwise: Joi.string().optional().allow(''),
        }),
        S3_REGION: Joi.when('STORAGE_DRIVER', {
          is: 's3',
          then: Joi.string().required(),
          otherwise: Joi.string().optional().allow(''),
        }),
        S3_ACCESS_KEY: Joi.when('STORAGE_DRIVER', {
          is: 's3',
          then: Joi.string().required(),
          otherwise: Joi.string().optional().allow(''),
        }),
        S3_SECRET_KEY: Joi.when('STORAGE_DRIVER', {
          is: 's3',
          then: Joi.string().required(),
          otherwise: Joi.string().optional().allow(''),
        }),
        S3_ENDPOINT: Joi.string().optional().allow(''),
        SMTP_HOST: Joi.string().optional().allow(''),
        SMTP_PORT: Joi.number().optional(),
        SMTP_USER: Joi.string().optional().allow(''),
        SMTP_PASS: Joi.string().optional().allow(''),
        SMTP_FROM: Joi.string().optional().allow(''),
        FRONTEND_URL: Joi.string().optional().allow(''),
      }),
    }),
    PrismaModule,
    StorageModule,
    MailerModule,
    AuthModule,
    UsersModule,
    InvitationsModule,
    TemplatesModule,
    GuestsModule,
    RsvpModule,
    TestimonialsModule,
    MediaModule,
    CommentsModule,
    SettingsModule,
    AssetsModule,
    NotificationsModule,
    BugFeedbackModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
