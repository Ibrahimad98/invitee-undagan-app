import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let prisma: any;

  const mockTemplate = {
    id: 'tpl-1',
    name: 'Super Classic',
    slug: 'super-classic',
    thumbnailUrl: '/images/super-classic.jpg',
    category: 'elegan',
    tags: ['classic', 'elegant'],
    cssClass: 'theme-super-classic',
    isPremium: false,
    isActive: true,
    layoutType: 'SCROLL',
    ratingAvg: 4.5,
    ratingCount: 10,
    usageCount: 100,
    sortOrder: 0,
    supportedEventTypes: ['WEDDING', 'ENGAGEMENT'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      template: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
  });

  describe('findAll', () => {
    it('should return paginated templates', async () => {
      prisma.template.findMany.mockResolvedValue([mockTemplate]);
      prisma.template.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by category', async () => {
      prisma.template.findMany.mockResolvedValue([mockTemplate]);
      prisma.template.count.mockResolvedValue(1);

      await service.findAll({ category: 'elegan' });

      expect(prisma.template.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'elegan' }),
        }),
      );
    });

    it('should filter by eventType using supportedEventTypes', async () => {
      prisma.template.findMany.mockResolvedValue([mockTemplate]);
      prisma.template.count.mockResolvedValue(1);

      await service.findAll({ eventType: 'WEDDING' });

      expect(prisma.template.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            supportedEventTypes: { has: 'WEDDING' },
          }),
        }),
      );
    });

    it('should fallback to all templates when eventType filter has 0 results', async () => {
      // First call (filtered) returns 0
      prisma.template.findMany.mockResolvedValueOnce([]);
      prisma.template.count.mockResolvedValueOnce(0);
      // Second call (fallback) returns results
      prisma.template.findMany.mockResolvedValueOnce([mockTemplate]);
      prisma.template.count.mockResolvedValueOnce(1);

      const result = await service.findAll({ eventType: 'CUSTOM' });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findAllPublic', () => {
    it('should return public templates with limited fields', async () => {
      prisma.template.findMany.mockResolvedValue([mockTemplate]);
      prisma.template.count.mockResolvedValue(1);

      const result = await service.findAllPublic({});

      expect(result.data).toHaveLength(1);
      expect(prisma.template.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            name: true,
            slug: true,
          }),
        }),
      );
    });
  });

  describe('findAllAdmin', () => {
    it('should return all templates including inactive', async () => {
      prisma.template.findMany.mockResolvedValue([mockTemplate, { ...mockTemplate, id: 'tpl-2', isActive: false }]);
      prisma.template.count.mockResolvedValue(2);

      const result = await service.findAllAdmin({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
    });
  });

  describe('toggleActive', () => {
    it('should toggle isActive from true to false', async () => {
      prisma.template.findUnique.mockResolvedValue(mockTemplate);
      prisma.template.update.mockResolvedValue({ ...mockTemplate, isActive: false });

      const result = await service.toggleActive('tpl-1');

      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if template not found', async () => {
      prisma.template.findUnique.mockResolvedValue(null);

      await expect(service.toggleActive('tpl-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return template by id', async () => {
      prisma.template.findUnique.mockResolvedValue(mockTemplate);

      const result = await service.findById('tpl-1');

      expect(result.slug).toBe('super-classic');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.template.findUnique.mockResolvedValue(null);

      await expect(service.findById('tpl-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new template', async () => {
      prisma.template.create.mockResolvedValue(mockTemplate);

      const result = await service.create({
        name: 'Super Classic',
        slug: 'super-classic',
        thumbnailUrl: '/images/super-classic.jpg',
        category: 'elegan',
        cssClass: 'theme-super-classic',
      } as any);

      expect(result.name).toBe('Super Classic');
    });
  });

  describe('update', () => {
    it('should update an existing template', async () => {
      prisma.template.findUnique.mockResolvedValue(mockTemplate);
      prisma.template.update.mockResolvedValue({ ...mockTemplate, name: 'Updated Name' });

      const result = await service.update('tpl-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException if template not found', async () => {
      prisma.template.findUnique.mockResolvedValue(null);

      await expect(service.update('tpl-999', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should deactivate a template (soft delete)', async () => {
      prisma.template.findUnique.mockResolvedValue(mockTemplate);
      prisma.template.update.mockResolvedValue({ ...mockTemplate, isActive: false });

      const result = await service.remove('tpl-1');

      expect(result.message).toContain('deactivated');
    });

    it('should throw NotFoundException if template not found', async () => {
      prisma.template.findUnique.mockResolvedValue(null);

      await expect(service.remove('tpl-999')).rejects.toThrow(NotFoundException);
    });
  });
});
