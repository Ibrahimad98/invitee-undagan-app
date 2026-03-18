import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteSettingDto, UpdateSiteSettingDto } from './dto/site-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /** Get all settings (admin) */
  async findAll(category?: string) {
    const where = category ? { category } : {};
    return this.prisma.siteSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  /** Get active settings by category (public) */
  async findPublic(category?: string) {
    const where: any = { isActive: true };
    if (category) where.category = category;
    return this.prisma.siteSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      select: {
        id: true,
        category: true,
        item: true,
        value: true,
        description: true,
        sortOrder: true,
      },
    });
  }

  /** Create a new setting */
  async create(dto: CreateSiteSettingDto) {
    return this.prisma.siteSetting.create({ data: dto });
  }

  /** Update a setting */
  async update(id: string, dto: UpdateSiteSettingDto) {
    return this.prisma.siteSetting.update({ where: { id }, data: dto });
  }

  /** Delete a setting */
  async remove(id: string) {
    return this.prisma.siteSetting.delete({ where: { id } });
  }
}
