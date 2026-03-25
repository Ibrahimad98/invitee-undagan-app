import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: any;

  const mockSetting = {
    id: 'setting-1',
    category: 'system',
    item: 'email_verification',
    value: 'true',
    description: 'Wajibkan verifikasi email',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      siteSetting: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
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

  describe('ensureDefaults', () => {
    it('should create default settings when no legacy or existing rows', async () => {
      // All findFirst calls return null (5 legacy + 6 defaults + 1 stale)
      prisma.siteSetting.findFirst.mockResolvedValue(null);
      prisma.siteSetting.create.mockResolvedValue(mockSetting);

      await service.ensureDefaults();

      // 5 legacy lookups + 6 default lookups + 1 stale lookup = 12
      expect(prisma.siteSetting.findFirst).toHaveBeenCalledTimes(12);
      // Only 6 creates for the defaults (no legacy found, no stale found)
      expect(prisma.siteSetting.create).toHaveBeenCalledTimes(6);
    });

    it('should not create settings that already exist', async () => {
      // All findFirst return something (legacy + defaults + stale all exist)
      prisma.siteSetting.findFirst.mockResolvedValue(mockSetting);
      prisma.siteSetting.update.mockResolvedValue(mockSetting);
      prisma.siteSetting.delete.mockResolvedValue(mockSetting);

      await service.ensureDefaults();

      // No creates because defaults already exist
      expect(prisma.siteSetting.create).not.toHaveBeenCalled();
    });

    it('should migrate legacy settings and remove them', async () => {
      const legacyRow = { id: 'legacy-1', value: 'custom-value' };
      const systemRow = { id: 'system-1', value: 'default-value' };

      // First call (legacy lookup) returns old row, second call (system lookup) returns system row
      prisma.siteSetting.findFirst
        .mockResolvedValueOnce(legacyRow)  // legacy: registration/Email Verification
        .mockResolvedValueOnce(systemRow)  // system: email_verification
        .mockResolvedValue(null);          // everything else

      prisma.siteSetting.update.mockResolvedValue(systemRow);
      prisma.siteSetting.delete.mockResolvedValue(legacyRow);
      prisma.siteSetting.create.mockResolvedValue(mockSetting);

      await service.ensureDefaults();

      // Should have updated the system row with legacy value
      expect(prisma.siteSetting.update).toHaveBeenCalledWith({
        where: { id: 'system-1' },
        data: { value: 'custom-value' },
      });
      // Should have deleted the legacy row
      expect(prisma.siteSetting.delete).toHaveBeenCalledWith({
        where: { id: 'legacy-1' },
      });
    });
  });

  describe('getSystemValue', () => {
    it('should return value for existing system setting', async () => {
      prisma.siteSetting.findFirst.mockResolvedValue({ value: 'true' });

      const result = await service.getSystemValue('email_verification');

      expect(result).toBe('true');
      expect(prisma.siteSetting.findFirst).toHaveBeenCalledWith({
        where: { category: 'system', item: 'email_verification', isActive: true },
      });
    });

    it('should return null when setting not found', async () => {
      prisma.siteSetting.findFirst.mockResolvedValue(null);

      const result = await service.getSystemValue('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all settings', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([mockSetting]);

      const result = await service.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].category).toBe('system');
    });

    it('should filter by category', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([mockSetting]);

      await service.findAll('system');

      expect(prisma.siteSetting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'system' },
        }),
      );
    });
  });

  describe('findPublic', () => {
    it('should return only active settings', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([mockSetting]);

      const result = await service.findPublic('system');

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
        category: 'system',
        item: 'email_verification',
        value: 'true',
      });

      expect(result.category).toBe('system');
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
