import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findByInvitation(invitationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.invitationComment.findMany({
        where: { invitationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invitationComment.count({ where: { invitationId } }),
    ]);

    return {
      data: comments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateCommentDto) {
    return this.prisma.invitationComment.create({
      data: {
        invitationId: dto.invitationId,
        name: dto.name,
        message: dto.message,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.invitationComment.delete({ where: { id } });
  }
}
