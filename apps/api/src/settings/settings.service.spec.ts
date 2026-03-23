import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: any;

  const mockSetting = {
    id: 'setting-1',
    category: 'registration',
    item: 'Email Verification',
    value: 'true',
    description: 'Enable email verification',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      siteSetting: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  describe('findAll', () => {
    it('should return all settings', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([mockSetting]);

      const result = await service.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].category).toBe('registration');
    });

    it('should filter by category', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([mockSetting]);

      await service.findAll('registration');

      expect(prisma.siteSetting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'registration' },
        }),
      );
    });
  });

  describe('findPublic', () => {
    it('should return only active settings', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([mockSetting]);

      const result = await service.findPublic('registration');

      expect(prisma.siteSetting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
      expect(result.length).toBe(1);
    });
  });

  describe('create', () => {
    it('should create a new setting', async () => {
      prisma.siteSetting.create.mockResolvedValue(mockSetting);

      const result = await service.create({
        category: 'registration',
        item: 'Email Verification',
        value: 'true',
      });

      expect(result.category).toBe('registration');
    });
  });

  describe('update', () => {
    it('should update a setting', async () => {
      prisma.siteSetting.update.mockResolvedValue({ ...mockSetting, value: 'false' });

      const result = await service.update('setting-1', { value: 'false' });

      expect(result.value).toBe('false');
    });
  });

  describe('remove', () => {
    it('should delete a setting', async () => {
      prisma.siteSetting.delete.mockResolvedValue(mockSetting);

      const result = await service.remove('setting-1');

      expect(result.id).toBe('setting-1');
    });
  });
});
