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
        S3_BUCKET: Joi.string().optional().allow(''),
        S3_REGION: Joi.string().optional().allow(''),
        S3_ACCESS_KEY: Joi.string().optional().allow(''),
        S3_SECRET_KEY: Joi.string().optional().allow(''),
        S3_ENDPOINT: Joi.string().optional().allow(''),
      }),
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    InvitationsModule,
    TemplatesModule,
    GuestsModule,
    RsvpModule,
    TestimonialsModule,
    MediaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
