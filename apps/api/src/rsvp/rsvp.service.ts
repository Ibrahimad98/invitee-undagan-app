import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Injectable()
export class RsvpService {
  constructor(private prisma: PrismaService) {}

  async findAllByInvitation(invitationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [rsvps, total] = await Promise.all([
      this.prisma.rsvp.findMany({
        where: { invitationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.rsvp.count({ where: { invitationId } }),
    ]);

    return {
      data: rsvps,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateRsvpDto) {
    return this.prisma.rsvp.create({
      data: {
        ...dto,
        attendance: dto.attendance as any,
        numGuests: dto.numGuests || 1,
      },
    });
  }

  async getStats(invitationId: string) {
    const stats = await this.prisma.rsvp.groupBy({
      by: ['attendance'],
      where: { invitationId },
      _count: true,
    });

    const total = stats.reduce((sum, s) => sum + s._count, 0);

    return {
      total,
      attending: stats.find((s) => s.attendance === 'ATTENDING')?._count ?? 0,
      notAttending: stats.find((s) => s.attendance === 'NOT_ATTENDING')?._count ?? 0,
      maybe: stats.find((s) => s.attendance === 'MAYBE')?._count ?? 0,
    };
  }
}
