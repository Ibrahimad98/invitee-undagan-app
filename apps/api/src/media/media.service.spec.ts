import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_SERVICE } from '../storage/storage.interface';
import { NotFoundException } from '@nestjs/common';

describe('MediaService', () => {
  let service: MediaService;
  let prisma: any;
  let storageService: any;

  const mockMedia = {
    id: 'media-1',
    fileUrl: 'gallery/abc123.jpg',
    fileType: 'image',
    fileSize: 1024000,
    originalName: 'photo.jpg',
    purpose: 'GALLERY',
    sortOrder: 0,
    invitationId: 'inv-1',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      media: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
    };

    storageService = {
      upload: vi.fn().mockResolvedValue('gallery/abc123.jpg'),
      getUrl: vi.fn().mockImplementation((key: string) => Promise.resolve(`https://s3.example.com/${key}`)),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: prisma },
        { provide: STORAGE_SERVICE, useValue: storageService },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  describe('upload', () => {
    it('should upload a file and create media record', async () => {
      const mockFile = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 1024000,
        buffer: Buffer.from('fake-data'),
      } as Express.Multer.File;

      prisma.media.create.mockResolvedValue(mockMedia);

      const result = await service.upload(mockFile, 'inv-1', 'user-1', 'GALLERY');

      expect(result.fileUrl).toBeDefined();
      expect(storageService.upload).toHaveBeenCalled();
      expect(prisma.media.create).toHaveBeenCalled();
    });

    it('should detect video file type', async () => {
      const mockFile = {
        originalname: 'video.mp4',
        mimetype: 'video/mp4',
        size: 5000000,
        buffer: Buffer.from('fake-data'),
      } as Express.Multer.File;

      prisma.media.create.mockResolvedValue({ ...mockMedia, fileType: 'video' });

      const result = await service.upload(mockFile, 'inv-1', 'user-1', 'GALLERY');

      expect(prisma.media.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ fileType: 'video' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return media with resolved URL', async () => {
      prisma.media.findUnique.mockResolvedValue(mockMedia);

      const result = await service.findById('media-1');

      expect(result.fileUrl).toContain('https://');
      expect(storageService.getUrl).toHaveBeenCalledWith('gallery/abc123.jpg');
    });

    it('should throw NotFoundException if media not found', async () => {
      prisma.media.findUnique.mockResolvedValue(null);

      await expect(service.findById('media-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete media from storage and database', async () => {
      prisma.media.findUnique.mockResolvedValue(mockMedia);
      prisma.media.delete.mockResolvedValue(mockMedia);

      const result = await service.remove('media-1');

      expect(result.message).toContain('deleted');
      expect(storageService.delete).toHaveBeenCalledWith('gallery/abc123.jpg');
      expect(prisma.media.delete).toHaveBeenCalledWith({ where: { id: 'media-1' } });
    });

    it('should throw NotFoundException if media not found', async () => {
      prisma.media.findUnique.mockResolvedValue(null);

      await expect(service.remove('media-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByInvitation', () => {
    it('should return all media for an invitation with resolved URLs', async () => {
      prisma.media.findMany.mockResolvedValue([mockMedia, { ...mockMedia, id: 'media-2' }]);

      const result = await service.findByInvitation('inv-1');

      expect(result).toHaveLength(2);
      expect(result[0].fileUrl).toContain('https://');
      expect(storageService.getUrl).toHaveBeenCalledTimes(2);
    });

    it('should return empty array when no media', async () => {
      prisma.media.findMany.mockResolvedValue([]);

      const result = await service.findByInvitation('inv-1');

      expect(result).toHaveLength(0);
    });
  });
});
