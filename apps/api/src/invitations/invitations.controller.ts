import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
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

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invitations for current user' })
  async findAll(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.invitationsService.findAllByUser(userId, query.page, query.limit);
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
