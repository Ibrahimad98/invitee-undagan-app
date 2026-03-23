import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async findAll(@CurrentUser() currentUser: any, @Query('search') search?: string) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat mengakses data ini');
    }
    return this.usersService.findAll(search);
  }

  /** Admin creates a FAST_SERVE user with auto-generated password */
  @Post('fast-serve')
  @ApiOperation({ summary: 'Create a fast-serve user (admin only)' })
  async createFastServe(
    @CurrentUser() currentUser: any,
    @Body() dto: { fullName: string; phone?: string; email?: string },
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat membuat user fast-serve');
    }
    return this.usersService.createFastServeUser(dto);
  }

  /** Get guest limit increase requests (admin) */
  @Get('guest-limit-requests')
  @ApiOperation({ summary: 'Get guest limit requests (admin only)' })
  async getGuestLimitRequests(@CurrentUser() currentUser: any, @Query('status') status?: string) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat mengakses data ini');
    }
    return this.usersService.findGuestLimitRequests(status);
  }

  /** User requests a guest limit increase */
  @Post('guest-limit-requests')
  @ApiOperation({ summary: 'Request a guest limit increase' })
  async requestGuestLimitIncrease(
    @CurrentUser('id') userId: string,
    @Body() dto: { requestedAmount: number; reason?: string; invitationId?: string },
  ) {
    return this.usersService.requestGuestLimitIncrease(userId, dto);
  }

  /** Admin approves a guest limit request */
  @Patch('guest-limit-requests/:id/approve')
  @ApiOperation({ summary: 'Approve a guest limit request (admin only)' })
  async approveGuestLimitRequest(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
    @Body() dto: { adminNote?: string },
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat menyetujui permintaan');
    }
    return this.usersService.approveGuestLimitRequest(id, dto.adminNote);
  }

  /** Admin rejects a guest limit request */
  @Patch('guest-limit-requests/:id/reject')
  @ApiOperation({ summary: 'Reject a guest limit request (admin only)' })
  async rejectGuestLimitRequest(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
    @Body() dto: { adminNote?: string },
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat menolak permintaan');
    }
    return this.usersService.rejectGuestLimitRequest(id, dto.adminNote);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID (admin only)' })
  async updateUser(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat mengubah data pengguna');
    }
    if (id === currentUser.id && dto.role && dto.role !== 'ADMIN') {
      throw new ForbiddenException('Tidak bisa menurunkan role akun sendiri');
    }
    return this.usersService.adminUpdate(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID (admin only)' })
  async deleteUser(
    @CurrentUser() currentUser: any,
    @Param('id') id: string,
  ) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat menghapus pengguna');
    }
    if (id === currentUser.id) {
      throw new ForbiddenException('Tidak bisa menghapus akun sendiri');
    }
    return this.usersService.remove(id);
  }
}
