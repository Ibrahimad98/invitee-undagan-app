import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSiteSettingDto, UpdateSiteSettingDto } from './dto/site-setting.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  /** Public: get active settings (used on contact page, etc.) */
  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get active site settings (public)' })
  async findPublic(@Query('category') category?: string) {
    return this.settingsService.findPublic(category);
  }

  /** Admin: get all settings */
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all site settings (admin)' })
  async findAll(@Query('category') category?: string) {
    return this.settingsService.findAll(category);
  }

  /** Admin: create setting */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a site setting' })
  async create(@Body() dto: CreateSiteSettingDto) {
    return this.settingsService.create(dto);
  }

  /** Admin: update setting */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a site setting' })
  async update(@Param('id') id: string, @Body() dto: UpdateSiteSettingDto) {
    return this.settingsService.update(id, dto);
  }

  /** Admin: delete setting */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a site setting' })
  async remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}
