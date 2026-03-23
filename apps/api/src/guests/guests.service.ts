import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    // Check guest limit during beta
    await this.checkGuestLimit(dto.invitationId, 1);
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

    // Check guest limit during beta
    await this.checkGuestLimit(invitationId, guests.length);

    const created = await this.prisma.guest.createMany({
      data: guests.map((g) => ({
        ...g,
        invitationId,
      })),
    });

    return { message: `${created.count} guests imported`, count: created.count };
  }

  /** Import guests from an Excel file buffer */
  async importFromExcel(buffer: Buffer, invitationId: string) {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheet = workbook.worksheets[0];
    if (!sheet) throw new BadRequestException('File Excel tidak memiliki worksheet');

    const guests: { name: string; phone?: string; email?: string; groupName?: string }[] = [];

    // Find header row (first row)
    const headerRow = sheet.getRow(1);
    const headers: Record<string, number> = {};
    headerRow.eachCell((cell, colNumber) => {
      const val = String(cell.value || '').toLowerCase().trim();
      if (val.includes('nama') || val === 'name') headers.name = colNumber;
      else if (val.includes('telp') || val.includes('phone') || val.includes('hp') || val.includes('no.')) headers.phone = colNumber;
      else if (val.includes('email')) headers.email = colNumber;
      else if (val.includes('grup') || val.includes('group') || val.includes('kelompok')) headers.groupName = colNumber;
    });

    if (!headers.name) {
      throw new BadRequestException('Kolom "Nama" tidak ditemukan di header Excel. Pastikan ada kolom dengan nama "Nama" atau "Name".');
    }

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const name = String(row.getCell(headers.name).value || '').trim();
      if (!name) return;

      guests.push({
        name,
        phone: headers.phone ? String(row.getCell(headers.phone).value || '').trim() || undefined : undefined,
        email: headers.email ? String(row.getCell(headers.email).value || '').trim() || undefined : undefined,
        groupName: headers.groupName ? String(row.getCell(headers.groupName).value || '').trim() || undefined : undefined,
      });
    });

    if (guests.length === 0) {
      throw new BadRequestException('Tidak ada data tamu yang valid dalam file Excel');
    }

    // Check guest limit during beta
    await this.checkGuestLimit(invitationId, guests.length);

    const created = await this.prisma.guest.createMany({
      data: guests.map((g) => ({ ...g, invitationId })),
    });

    return { message: `${created.count} tamu berhasil diimpor dari Excel`, count: created.count };
  }

  /** Check if adding more guests would exceed the user's maxGuests limit (beta) */
  private async checkGuestLimit(invitationId: string, addCount: number) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { userId: true },
    });
    if (!invitation) return;

    const user = await this.prisma.user.findUnique({
      where: { id: invitation.userId },
      select: { maxGuests: true },
    });
    if (!user) return;

    // Count total guests across ALL invitations for this user
    const totalGuests = await this.prisma.guest.count({
      where: { invitation: { userId: invitation.userId } },
    });

    if (totalGuests + addCount > user.maxGuests) {
      const remaining = Math.max(0, user.maxGuests - totalGuests);
      throw new BadRequestException(
        `Batas maksimal tamu Anda adalah ${user.maxGuests} (tersisa ${remaining}). ` +
        `Anda mencoba menambahkan ${addCount} tamu. ` +
        `Upgrade ke Premium untuk mendapatkan kuota hingga 2000 tamu melalui menu Langganan.`,
      );
    }
  }

  async markAsSent(id: string, sentVia: string) {
    return this.prisma.guest.update({
      where: { id },
      data: { isSent: true, sentAt: new Date(), sentVia },
    });
  }

  /** Mark multiple guests as sent (for WA blast) */
  async markManySent(ids: string[], sentVia: string) {
    const result = await this.prisma.guest.updateMany({
      where: { id: { in: ids } },
      data: { isSent: true, sentAt: new Date(), sentVia },
    });
    return { message: `${result.count} tamu ditandai terkirim`, count: result.count };
  }
}
