import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Upload a file (max 2MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        invitationId: { type: 'string' },
        purpose: { type: 'string', enum: ['GALLERY', 'COVER', 'PROFILE', 'MUSIC'] },
        sortOrder: { type: 'number' },
      },
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('invitationId') invitationId: string,
    @Query('purpose') purpose: string,
    @Query('sortOrder') sortOrder: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.mediaService.upload(
      file,
      invitationId || undefined,
      userId,
      purpose || 'GALLERY',
      parseInt(sortOrder) || 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  async findOne(@Param('id') id: string) {
    return this.mediaService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get media by invitation' })
  async findByInvitation(@Query('invitationId') invitationId: string) {
    return this.mediaService.findByInvitation(invitationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
