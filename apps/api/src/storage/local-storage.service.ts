import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from './storage.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get<string>('STORAGE_LOCAL_PATH', './uploads');
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, filePath: string): Promise<string> {
    const fullPath = path.join(this.uploadPath, filePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, file.buffer);
    return filePath;
  }

  async uploadBuffer(buffer: Buffer, filePath: string, _contentType: string): Promise<string> {
    const fullPath = path.join(this.uploadPath, filePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, buffer);
    return filePath;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadPath, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  async getUrl(filePath: string): Promise<string> {
    return `/uploads/${filePath}`;
  }

  async getSignedUrl(filePath: string, _expiresIn?: number): Promise<string> {
    return this.getUrl(filePath);
  }

  async getStream(filePath: string): Promise<{ stream: import('stream').Readable; contentType: string; contentLength?: number }> {
    const fullPath = path.join(this.uploadPath, filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    const ext = path.extname(fullPath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
      '.mp3': 'audio/mpeg', '.mp4': 'video/mp4',
    };
    const stat = fs.statSync(fullPath);
    return {
      stream: fs.createReadStream(fullPath),
      contentType: mimeMap[ext] || 'application/octet-stream',
      contentLength: stat.size,
    };
  }
}
