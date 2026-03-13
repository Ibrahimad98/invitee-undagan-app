import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, approvedOnly = true) {
    const skip = (page - 1) * limit;
    const where = approvedOnly ? { isApproved: true } : {};

    const [testimonials, total] = await Promise.all([
      this.prisma.testimonial.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.testimonial.count({ where }),
    ]);

    return {
      data: testimonials,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({
      data: { ...dto, isApproved: false },
    });
  }

  async approve(id: string, isApproved: boolean) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw new NotFoundException('Testimonial not found');

    return this.prisma.testimonial.update({
      where: { id },
      data: { isApproved },
    });
  }

  async remove(id: string) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    await this.prisma.testimonial.delete({ where: { id } });
    return { message: 'Testimonial deleted' };
  }
}
