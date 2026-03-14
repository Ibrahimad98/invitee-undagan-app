import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';
import { Public } from '../common/decorators/public.decorator';

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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.rsvpService.findAllByInvitation(invitationId, Number(page) || 1, Number(limit) || 50);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get RSVP statistics' })
  async getStats(@Query('invitationId') invitationId: string) {
    return this.rsvpService.getStats(invitationId);
  }
}
