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
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await this.s3Client.send(command);
    return filePath;
  }

  async uploadBuffer(buffer: Buffer, filePath: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
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

  /**
   * Returns a presigned URL for private bucket access.
   * URLs expire in 1 hour (3600s) by default.
   */
  async getUrl(filePath: string): Promise<string> {
    return this.getSignedUrl(filePath, 3600);
  }

  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async getStream(filePath: string): Promise<{ stream: import('stream').Readable; contentType: string; contentLength?: number }> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });

    const response = await this.s3Client.send(command);
    return {
      stream: response.Body as import('stream').Readable,
      contentType: response.ContentType || 'application/octet-stream',
      contentLength: response.ContentLength,
    };
  }
}
