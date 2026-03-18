import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, isDeleted: false },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...result } = user;
    return result;
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: any = { ...dto };
    // Convert dateOfBirth string to Date object for Prisma
    if (dto.dateOfBirth) {
      data.dateOfBirth = new Date(dto.dateOfBirth);
    }
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    const { passwordHash, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return {
      data: users.map(({ passwordHash, ...rest }) => rest),
    };
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id, isDeleted: false },
    });
    if (!existing) throw new NotFoundException('User not found');

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.role !== undefined && { role: dto.role as any }),
        ...(dto.subscriptionType !== undefined && { subscriptionType: dto.subscriptionType as any }),
        ...(dto.subscriptionExpireDate !== undefined && {
          subscriptionExpireDate: new Date(dto.subscriptionExpireDate),
        }),
      },
    });
    const { passwordHash, ...result } = user;
    return result;
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id, isDeleted: false },
    });
    if (!existing) throw new NotFoundException('User not found');

    // Soft delete: set isDeleted flag and deletedAt timestamp
    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return { message: 'Pengguna berhasil dihapus' };
  }
}
