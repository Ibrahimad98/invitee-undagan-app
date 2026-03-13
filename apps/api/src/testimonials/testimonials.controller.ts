import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { Public } from '../common/decorators/public.decorator';
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

  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all testimonials including unapproved (admin)' })
  async findAllAdmin(@Query() query: PaginationDto) {
    return this.testimonialsService.findAll(query.page, query.limit, false);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a testimonial (public)' })
  async create(@Body() dto: CreateTestimonialDto) {
    return this.testimonialsService.create(dto);
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
