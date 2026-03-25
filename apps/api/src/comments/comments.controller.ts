import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get comments for an invitation (public)' })
  async findByInvitation(
    @Query('invitationId') invitationId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentsService.findByInvitation(
      invitationId,
      Number(page) || 1,
      Number(limit) || 50,
    );
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a comment on an invitation (public, no auth required)' })
  async create(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment (auth required)' })
  async remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}
