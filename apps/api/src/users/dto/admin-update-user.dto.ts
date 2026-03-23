import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
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

  @ApiPropertyOptional({ enum: ['BASIC', 'PREMIUM', 'FAST_SERVE'] })
  @IsOptional()
  @IsEnum(['BASIC', 'PREMIUM', 'FAST_SERVE'], { message: 'Subscription harus BASIC, PREMIUM, atau ENTERPRISE' })
  subscriptionType?: string;

  @ApiPropertyOptional({ description: 'Subscription expiry date (ISO date string)' })
  @IsOptional()
  @IsDateString()
  subscriptionExpireDate?: string;

  @ApiPropertyOptional({ description: 'Maximum guests this user can invite (beta default: 100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxGuests?: number;
}
