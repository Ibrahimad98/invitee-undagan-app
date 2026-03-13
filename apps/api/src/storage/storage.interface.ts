export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export interface IStorageService {
  upload(file: Express.Multer.File, path: string): Promise<string>;
  delete(filePath: string): Promise<void>;
  getUrl(filePath: string): string;
  getSignedUrl(filePath: string, expiresIn?: number): Promise<string>;
}
