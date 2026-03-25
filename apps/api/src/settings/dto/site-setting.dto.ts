import { IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSiteSettingDto {
  @ApiProperty({ example: 'contact' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'WhatsApp' })
  @IsString()
  item: string;

  @ApiProperty({ example: '08123456789' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ example: 'Hubungi kami via WhatsApp' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSiteSettingDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  item?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
