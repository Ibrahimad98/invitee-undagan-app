import { Injectable, Inject, Logger } from '@nestjs/common';
import { STORAGE_SERVICE, IStorageService } from '../storage/storage.interface';
import * as fs from 'fs';
import * as path from 'path';

/** Simple content-type lookup by extension */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.json': 'application/json',
  };
  return map[ext] || 'application/octet-stream';
}

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @Inject(STORAGE_SERVICE) private storageService: IStorageService,
  ) {}

  /**
   * Get a presigned/accessible URL for a static asset stored in S3.
   * @param assetPath - e.g. "images/gallery/sample-1.jpg"
   */
  async getAssetUrl(assetPath: string): Promise<string> {
    const s3Key = `assets/${assetPath}`;
    return this.storageService.getUrl(s3Key);
  }

  /**
   * Stream the asset content directly from S3 (avoids CORS/redirect issues).
   */
  async getAssetStream(assetPath: string): Promise<{ stream: import('stream').Readable; contentType: string; contentLength?: number }> {
    const s3Key = `assets/${assetPath}`;
    return this.storageService.getStream(s3Key);
  }

  /**
   * Upload all static assets from a local directory to S3 under the "assets/" prefix.
   * This is used for one-time migration of public/images/* to the S3 bucket.
   */
  async migrateStaticAssets(localDir: string): Promise<{ uploaded: string[]; errors: string[] }> {
    const uploaded: string[] = [];
    const errors: string[] = [];

    const uploadPromises: Promise<void>[] = [];

    const walkDir = (dir: string, prefix: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          walkDir(fullPath, relativePath);
        } else {
          const contentType = getMimeType(entry.name);
          const s3Key = `assets/${relativePath}`;
          const buffer = fs.readFileSync(fullPath);

          uploaded.push(s3Key);
          const promise = this.storageService.uploadBuffer(buffer, s3Key, contentType)
            .then(() => {
              this.logger.debug(`Uploaded ${s3Key}`);
            })
            .catch((err) => {
              this.logger.error(`Failed to upload ${s3Key}: ${err.message}`);
              errors.push(s3Key);
            });
          uploadPromises.push(promise);
        }
      }
    };

    walkDir(localDir, '');

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    this.logger.log(`Migration complete: ${uploaded.length} files queued, ${errors.length} errors`);
    return { uploaded, errors };
  }

  /**
   * Upload a single file buffer to S3 assets.
   */
  async uploadAsset(buffer: Buffer, assetPath: string, contentType: string): Promise<string> {
    const s3Key = `assets/${assetPath}`;
    await this.storageService.uploadBuffer(buffer, s3Key, contentType);
    return s3Key;
  }
}
