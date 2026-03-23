import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_SERVICE } from './storage.interface';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('StorageModule');
        const driver = configService.get<string>('STORAGE_DRIVER', 'local');
        logger.log(
          `Storage driver: "${driver}" (S3_BUCKET: "${configService.get('S3_BUCKET')}")`,
        );

        if (driver === 's3') {
          return new S3StorageService(configService);
        }

        return new LocalStorageService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
