import { Readable } from 'stream';

export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export interface IStorageService {
  upload(file: Express.Multer.File, path: string): Promise<string>;
  /** Upload raw buffer (for migration scripts, seeding, etc.) */
  uploadBuffer(buffer: Buffer, path: string, contentType: string): Promise<string>;
  delete(filePath: string): Promise<void>;
  /** Returns a URL to access the file. For S3 private buckets this is a presigned URL. */
  getUrl(filePath: string): Promise<string>;
  getSignedUrl(filePath: string, expiresIn?: number): Promise<string>;
  /** Stream the file content directly (for proxying through the backend). */
  getStream(filePath: string): Promise<{ stream: Readable; contentType: string; contentLength?: number }>;
}
