import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Get('dashboard/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@CurrentUser('id') userId: string) {
    return this.invitationsService.getDashboardStats(userId);
  }

  @Get('export/excel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export invitation guest data as Excel (Premium)' })
  async exportExcel(
    @CurrentUser('id') userId: string,
    @Query('baseUrl') baseUrl: string,
    @Query('invitationId') invitationId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.invitationsService.exportToExcel(userId, invitationId, baseUrl);
    const filename = `rekap-undangan-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.status(HttpStatus.OK).send(buffer);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invitations for current user' })
  async findAll(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.invitationsService.findAllByUser(userId, query.page, query.limit);
  }

  @Get('admin/by-user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invitations by user ID (admin only)' })
  async findByUserId(
    @CurrentUser() currentUser: any,
    @Param('userId') userId: string,
    @Query() query: PaginationDto,
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat mengakses data ini');
    }
    return this.invitationsService.findAllByUser(userId, query.page, query.limit || 100);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invitation by ID' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.invitationsService.findById(id, userId);
  }

  @Public()
  @Get('public/:slug')
  @ApiOperation({ summary: 'Get invitation by slug (public)' })
  async findBySlug(@Param('slug') slug: string) {
    return this.invitationsService.findBySlugPublic(slug);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new invitation' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(userId, dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an invitation' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateInvitationDto,
  ) {
    return this.invitationsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an invitation' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.invitationsService.remove(id, userId);
  }
}
