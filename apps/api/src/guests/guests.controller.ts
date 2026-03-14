import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { ImportGuestsDto } from './dto/import-guests.dto';

@ApiTags('Guests')
@ApiBearerAuth()
@Controller('guests')
export class GuestsController {
  constructor(private guestsService: GuestsService) {}

  @Get()
  @ApiOperation({ summary: 'Get guests for an invitation' })
  async findAll(
    @Query('invitationId') invitationId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.guestsService.findAllByInvitation(invitationId, Number(page) || 1, Number(limit) || 50);
  }

  @Post()
  @ApiOperation({ summary: 'Create a guest' })
  async create(@Body() dto: CreateGuestDto) {
    return this.guestsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a guest' })
  async update(@Param('id') id: string, @Body() dto: UpdateGuestDto) {
    return this.guestsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a guest' })
  async remove(@Param('id') id: string) {
    return this.guestsService.remove(id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import guests from CSV data' })
  async importGuests(@Body() dto: ImportGuestsDto) {
    return this.guestsService.importGuests(dto);
  }

  @Patch(':id/sent')
  @ApiOperation({ summary: 'Mark guest as sent' })
  async markAsSent(@Param('id') id: string, @Body('sentVia') sentVia: string) {
    return this.guestsService.markAsSent(id, sentVia);
  }
}
