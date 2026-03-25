import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: any;

  const mockComment = {
    id: 'comment-1',
    invitationId: 'inv-1',
    name: 'John Doe',
    message: 'Congratulations!',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      invitationComment: {
        findMany: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  describe('findByInvitation', () => {
    it('should return paginated comments', async () => {
      prisma.invitationComment.findMany.mockResolvedValue([mockComment]);
      prisma.invitationComment.count.mockResolvedValue(1);

      const result = await service.findByInvitation('inv-1');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('John Doe');
      expect(result.meta.total).toBe(1);
    });

    it('should handle pagination', async () => {
      prisma.invitationComment.findMany.mockResolvedValue([]);
      prisma.invitationComment.count.mockResolvedValue(0);

      const result = await service.findByInvitation('inv-1', 2, 10);

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('create', () => {
    it('should create a comment', async () => {
      prisma.invitationComment.create.mockResolvedValue(mockComment);

      const result = await service.create({
        invitationId: 'inv-1',
        name: 'John Doe',
        message: 'Congratulations!',
      });

      expect(result.name).toBe('John Doe');
      expect(result.message).toBe('Congratulations!');
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      prisma.invitationComment.delete.mockResolvedValue(mockComment);

      const result = await service.remove('comment-1');

      expect(result.id).toBe('comment-1');
    });
  });
});
