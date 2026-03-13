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

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadPath, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  getUrl(filePath: string): string {
    return `/uploads/${filePath}`;
  }

  async getSignedUrl(filePath: string, _expiresIn?: number): Promise<string> {
    // Local storage doesn't need signed URLs
    return this.getUrl(filePath);
  }
}
