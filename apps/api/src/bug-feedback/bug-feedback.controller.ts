import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BugFeedbackService } from './bug-feedback.service';
import { CreateBugFeedbackDto } from './dto/create-bug-feedback.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Bug Feedback')
@ApiBearerAuth()
@Controller('bug-feedback')
export class BugFeedbackController {
  constructor(private bugFeedbackService: BugFeedbackService) {}

  /** User submits a bug feedback */
  @Post()
  @ApiOperation({ summary: 'Submit a bug feedback' })
  async create(
    @CurrentUser() currentUser: any,
    @Body() dto: CreateBugFeedbackDto,
  ) {
    return this.bugFeedbackService.create(currentUser.id, currentUser.fullName || 'Anonim', dto);
  }

  /** User gets their own bug feedbacks */
  @Get('mine')
  @ApiOperation({ summary: 'Get my bug feedbacks' })
  async findMine(@CurrentUser('id') userId: string) {
    return this.bugFeedbackService.findByUser(userId);
  }

  /** Admin gets all bug feedbacks */
  @Get()
  @ApiOperation({ summary: 'Get all bug feedbacks (admin only)' })
  async findAll(
    @CurrentUser() currentUser: any,
    @Query('status') status?: string,
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat mengakses data ini');
    }
    return this.bugFeedbackService.findAll(status);
  }

  /** Admin marks bug as handled */
  @Patch(':id/handle')
  @ApiOperation({ summary: 'Mark bug feedback as handled (admin only)' })
  async markHandled(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
    @Body() dto: { adminNote?: string },
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat menangani laporan bug');
    }
    return this.bugFeedbackService.markHandled(id, dto.adminNote);
  }

  /** Admin marks bug as unhandled */
  @Patch(':id/unhandle')
  @ApiOperation({ summary: 'Mark bug feedback as unhandled (admin only)' })
  async markUnhandled(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat mengubah status laporan bug');
    }
    return this.bugFeedbackService.markUnhandled(id);
  }

  /** Admin deletes bug feedback */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete bug feedback (admin only)' })
  async remove(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat menghapus laporan bug');
    }
    return this.bugFeedbackService.remove(id);
  }
}
