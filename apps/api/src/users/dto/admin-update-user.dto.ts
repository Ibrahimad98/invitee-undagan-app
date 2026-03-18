import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['USER', 'ADMIN'] })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN'], { message: 'Role harus USER atau ADMIN' })
  role?: string;

  @ApiPropertyOptional({ enum: ['BASIC', 'PREMIUM'] })
  @IsOptional()
  @IsEnum(['BASIC', 'PREMIUM'], { message: 'Subscription harus BASIC atau PREMIUM' })
  subscriptionType?: string;

  @ApiPropertyOptional({ description: 'Subscription expiry date (ISO date string)' })
  @IsOptional()
  @IsDateString()
  subscriptionExpireDate?: string;
}
