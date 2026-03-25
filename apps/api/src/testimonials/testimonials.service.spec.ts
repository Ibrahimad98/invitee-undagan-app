import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TestimonialsService } from './testimonials.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('TestimonialsService', () => {
  let service: TestimonialsService;
  let prisma: any;
  let notificationsService: any;

  const mockTestimonial = {
    id: 'test-1',
    userId: 'user-1',
    userName: 'Test User',
    templateId: 'tpl-1',
    message: 'Great platform!',
    rating: 5,
    ratingDesain: 5,
    ratingKemudahan: 4,
    ratingLayanan: 5,
    isApproved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      testimonial: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
        aggregate: vi.fn(),
      },
      template: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      invitation: {
        findMany: vi.fn(),
      },
    };

    notificationsService = {
      notifyAdmins: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestimonialsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<TestimonialsService>(TestimonialsService);
  });

  describe('findAll', () => {
    it('should return approved testimonials by default', async () => {
      prisma.testimonial.findMany.mockResolvedValue([mockTestimonial]);
      prisma.testimonial.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(prisma.testimonial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isApproved: true },
        }),
      );
    });

    it('should return all testimonials when approvedOnly is false', async () => {
      prisma.testimonial.findMany.mockResolvedValue([mockTestimonial]);
      prisma.testimonial.count.mockResolvedValue(1);

      await service.findAll(1, 20, false);

      expect(prisma.testimonial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('should handle pagination', async () => {
      prisma.testimonial.findMany.mockResolvedValue([]);
      prisma.testimonial.count.mockResolvedValue(0);

      const result = await service.findAll(2, 10);

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('findByUser', () => {
    it('should return testimonials for a user', async () => {
      prisma.testimonial.findMany.mockResolvedValue([mockTestimonial]);

      const result = await service.findByUser('user-1');

      expect(result.data).toHaveLength(1);
      expect(prisma.testimonial.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
    });
  });

  describe('findUserTemplatesForReview', () => {
    it('should return templates with review status', async () => {
      prisma.invitation.findMany.mockResolvedValue([
        {
          id: 'inv-1',
          title: 'My Wedding',
          templates: [
            { template: { id: 'tpl-1', name: 'Classic', slug: 'classic', thumbnailUrl: '', category: 'elegan', cssClass: '', ratingAvg: 4, ratingCount: 5 } },
          ],
        },
      ]);
      prisma.testimonial.findMany.mockResolvedValue([]);

      const result = await service.findUserTemplatesForReview('user-1');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].hasReviewed).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a testimonial and notify admins', async () => {
      prisma.testimonial.findUnique.mockResolvedValue(null); // no existing
      prisma.template.findUnique.mockResolvedValue({ id: 'tpl-1' });
      prisma.testimonial.create.mockResolvedValue(mockTestimonial);
      prisma.testimonial.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { id: 10 } });
      prisma.template.update.mockResolvedValue({});

      const result = await service.create({
        userId: 'user-1',
        userName: 'Test User',
        templateId: 'tpl-1',
        message: 'Great!',
        rating: 5,
        ratingDesain: 5,
        ratingKemudahan: 4,
        ratingLayanan: 5,
      } as any);

      expect(result.userName).toBe('Test User');
      expect(notificationsService.notifyAdmins).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already reviewed template', async () => {
      prisma.testimonial.findUnique.mockResolvedValue(mockTestimonial);

      await expect(
        service.create({
          userId: 'user-1',
          templateId: 'tpl-1',
          userName: 'Test',
          message: 'Duplicate!',
          rating: 5,
        } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if template does not exist', async () => {
      prisma.testimonial.findUnique.mockResolvedValue(null);
      prisma.template.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          userId: 'user-1',
          templateId: 'tpl-999',
          userName: 'Test',
          message: 'Review',
          rating: 4,
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should approve a testimonial', async () => {
      prisma.testimonial.findUnique.mockResolvedValue(mockTestimonial);
      prisma.testimonial.update.mockResolvedValue({ ...mockTestimonial, isApproved: true });
      prisma.testimonial.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { id: 10 } });
      prisma.template.update.mockResolvedValue({});

      const result = await service.approve('test-1', true);

      expect(result.isApproved).toBe(true);
    });

    it('should throw NotFoundException if testimonial not found', async () => {
      prisma.testimonial.findUnique.mockResolvedValue(null);

      await expect(service.approve('test-999', true)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a testimonial and recalculate rating', async () => {
      prisma.testimonial.findUnique.mockResolvedValue(mockTestimonial);
      prisma.testimonial.delete.mockResolvedValue(mockTestimonial);
      prisma.testimonial.aggregate.mockResolvedValue({ _avg: { rating: 4.0 }, _count: { id: 9 } });
      prisma.template.update.mockResolvedValue({});

      const result = await service.remove('test-1');

      expect(result.message).toContain('deleted');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.testimonial.findUnique.mockResolvedValue(null);

      await expect(service.remove('test-999')).rejects.toThrow(NotFoundException);
    });
  });
});
