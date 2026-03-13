import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './storage.interface';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET', '');
    this.region = this.configService.get<string>('S3_REGION', 'us-east-1');
    this.endpoint = this.configService.get<string>('S3_ENDPOINT', '');

    const s3Config: any = {
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY', ''),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY', ''),
      },
    };

    // Support custom endpoints (Cloudflare R2, MinIO, etc.)
    if (this.endpoint) {
      s3Config.endpoint = this.endpoint;
      s3Config.forcePathStyle = true;
    }

    this.s3Client = new S3Client(s3Config);
  }

  async upload(file: Express.Multer.File, filePath: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return filePath;
  }

  async delete(filePath: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });

    await this.s3Client.send(command);
  }

  getUrl(filePath: string): string {
    if (this.endpoint) {
      // For R2 or custom endpoints
      return `${this.endpoint}/${this.bucket}/${filePath}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filePath}`;
  }

  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
