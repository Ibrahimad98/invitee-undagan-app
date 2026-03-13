import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { FilterTemplateDto } from './dto/filter-template.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all templates (public)' })
  async findAll(@Query() filter: FilterTemplateDto) {
    return this.templatesService.findAll(filter);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID (public)' })
  async findOne(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a template (admin only)' })
  async create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a template (admin only)' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) {
    return this.templatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a template (admin only)' })
  async remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }
}
