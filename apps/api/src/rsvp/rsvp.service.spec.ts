import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { RsvpService } from './rsvp.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RsvpService', () => {
  let service: RsvpService;
  let prisma: any;

  const mockRsvp = {
    id: 'rsvp-1',
    invitationId: 'inv-1',
    guestId: 'guest-1',
    guestName: 'John Doe',
    attendance: 'ATTENDING',
    numGuests: 2,
    message: 'Will be there!',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      rsvp: {
        findMany: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
        groupBy: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RsvpService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RsvpService>(RsvpService);
  });

  describe('findAllByInvitation', () => {
    it('should return paginated RSVPs', async () => {
      prisma.rsvp.findMany.mockResolvedValue([mockRsvp]);
      prisma.rsvp.count.mockResolvedValue(1);

      const result = await service.findAllByInvitation('inv-1');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].guestName).toBe('John Doe');
      expect(result.meta.total).toBe(1);
    });

    it('should handle pagination params', async () => {
      prisma.rsvp.findMany.mockResolvedValue([]);
      prisma.rsvp.count.mockResolvedValue(0);

      const result = await service.findAllByInvitation('inv-1', 3, 10);

      expect(result.meta.page).toBe(3);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('create', () => {
    it('should create an RSVP with default numGuests', async () => {
      prisma.rsvp.create.mockResolvedValue(mockRsvp);

      const result = await service.create({
        invitationId: 'inv-1',
        guestName: 'John Doe',
        attendance: 'ATTENDING',
      } as any);

      expect(result.guestName).toBe('John Doe');
      expect(prisma.rsvp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            numGuests: 1,
          }),
        }),
      );
    });

    it('should create an RSVP with custom numGuests', async () => {
      prisma.rsvp.create.mockResolvedValue({ ...mockRsvp, numGuests: 5 });

      const result = await service.create({
        invitationId: 'inv-1',
        guestName: 'Family',
        attendance: 'ATTENDING',
        numGuests: 5,
      } as any);

      expect(result.numGuests).toBe(5);
    });
  });

  describe('getStats', () => {
    it('should return RSVP statistics', async () => {
      prisma.rsvp.groupBy.mockResolvedValue([
        { attendance: 'ATTENDING', _count: 10 },
        { attendance: 'NOT_ATTENDING', _count: 3 },
        { attendance: 'MAYBE', _count: 2 },
      ]);

      const result = await service.getStats('inv-1');

      expect(result.total).toBe(15);
      expect(result.attending).toBe(10);
      expect(result.notAttending).toBe(3);
      expect(result.maybe).toBe(2);
    });

    it('should return zeros when no RSVPs', async () => {
      prisma.rsvp.groupBy.mockResolvedValue([]);

      const result = await service.getStats('inv-1');

      expect(result.total).toBe(0);
      expect(result.attending).toBe(0);
      expect(result.notAttending).toBe(0);
      expect(result.maybe).toBe(0);
    });
  });
});
