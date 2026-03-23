import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Import guests from JSON data' })
  async importGuests(@Body() dto: ImportGuestsDto) {
    return this.guestsService.importGuests(dto);
  }

  @Post('import-excel')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import guests from Excel file (.xlsx)' })
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('invitationId') invitationId: string,
  ) {
    if (!file) throw new BadRequestException('File Excel wajib diunggah');
    if (!invitationId) throw new BadRequestException('invitationId wajib diisi');
    return this.guestsService.importFromExcel(file.buffer, invitationId);
  }

  @Patch('batch/sent')
  @ApiOperation({ summary: 'Mark multiple guests as sent (for WA blast)' })
  async markManySent(@Body() dto: { ids: string[]; sentVia: string }) {
    if (!dto.ids || !dto.ids.length) throw new BadRequestException('ids wajib diisi');
    return this.guestsService.markManySent(dto.ids, dto.sentVia || 'WHATSAPP');
  }

  @Patch(':id/sent')
  @ApiOperation({ summary: 'Mark guest as sent' })
  async markAsSent(@Param('id') id: string, @Body('sentVia') sentVia: string) {
    return this.guestsService.markAsSent(id, sentVia);
  }
}
