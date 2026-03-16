import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private testimonialsService: TestimonialsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get approved testimonials (public)' })
  async findAll(@Query() query: PaginationDto) {
    return this.testimonialsService.findAll(query.page, query.limit, true);
  }

  @Get('mine')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user testimonials' })
  async findMine(@CurrentUser('id') userId: string) {
    return this.testimonialsService.findByUser(userId);
  }

  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all testimonials including unapproved (admin)' })
  async findAllAdmin(@Query() query: PaginationDto) {
    return this.testimonialsService.findAll(query.page, query.limit, false);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a testimonial (authenticated)' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateTestimonialDto) {
    return this.testimonialsService.create({ ...dto, userId });
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject testimonial' })
  async approve(@Param('id') id: string, @Body('isApproved') isApproved: boolean) {
    return this.testimonialsService.approve(id, isApproved);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a testimonial' })
  async remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
