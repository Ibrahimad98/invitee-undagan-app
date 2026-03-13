import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { Public } from '../common/decorators/public.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('RSVP')
@Controller('rsvp')
export class RsvpController {
  constructor(private rsvpService: RsvpService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit RSVP (public)' })
  async create(@Body() dto: CreateRsvpDto) {
    return this.rsvpService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get RSVPs for an invitation' })
  async findAll(
    @Query('invitationId') invitationId: string,
    @Query() query: PaginationDto,
  ) {
    return this.rsvpService.findAllByInvitation(invitationId, query.page, query.limit);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get RSVP statistics' })
  async getStats(@Query('invitationId') invitationId: string) {
    return this.rsvpService.getStats(invitationId);
  }
}
