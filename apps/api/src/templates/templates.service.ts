import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilterTemplateDto } from './dto/filter-template.dto';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterTemplateDto) {
    const { page = 1, limit = 20, search, category, isPremium, layoutType } = filter;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      ...(category && { category }),
      ...(isPremium !== undefined && { isPremium }),
      ...(layoutType && { layoutType }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search.toLowerCase()] } },
        ],
      }),
    };

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        orderBy: [{ usageCount: 'desc' }, { sortOrder: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data: templates,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const template = await this.prisma.template.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async create(dto: CreateTemplateDto) {
    return this.prisma.template.create({
      data: {
        ...dto,
        layoutType: (dto.layoutType as any) || 'SCROLL',
        tags: dto.tags || [],
      },
    });
  }

  async update(id: string, dto: Partial<CreateTemplateDto>) {
    await this.findById(id);
    return this.prisma.template.update({
      where: { id },
      data: {
        ...dto,
        layoutType: dto.layoutType as any,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.template.update({ where: { id }, data: { isActive: false } });
    return { message: 'Template deactivated' };
  }
}
