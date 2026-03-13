import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { ImportGuestsDto } from './dto/import-guests.dto';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async findAllByInvitation(invitationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [guests, total] = await Promise.all([
      this.prisma.guest.findMany({
        where: { invitationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.guest.count({ where: { invitationId } }),
    ]);

    return {
      data: guests,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateGuestDto) {
    return this.prisma.guest.create({ data: dto });
  }

  async update(id: string, dto: UpdateGuestDto) {
    const guest = await this.prisma.guest.findUnique({ where: { id } });
    if (!guest) throw new NotFoundException('Guest not found');
    return this.prisma.guest.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const guest = await this.prisma.guest.findUnique({ where: { id } });
    if (!guest) throw new NotFoundException('Guest not found');
    await this.prisma.guest.delete({ where: { id } });
    return { message: 'Guest deleted' };
  }

  async importGuests(dto: ImportGuestsDto) {
    const { invitationId, guests } = dto;

    const created = await this.prisma.guest.createMany({
      data: guests.map((g) => ({
        ...g,
        invitationId,
      })),
    });

    return { message: `${created.count} guests imported`, count: created.count };
  }

  async markAsSent(id: string, sentVia: string) {
    return this.prisma.guest.update({
      where: { id },
      data: { isSent: true, sentAt: new Date(), sentVia },
    });
  }
}
