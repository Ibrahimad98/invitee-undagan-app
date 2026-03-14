import { Controller, Get, Patch, Delete, Body, Param, ForbiddenException } from '@nestjs/common';
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
  async findAll(@CurrentUser() currentUser: any) {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Hanya admin yang dapat mengakses data ini');
    }
    return this.usersService.findAll();
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
    // Prevent admin from demoting themselves
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
