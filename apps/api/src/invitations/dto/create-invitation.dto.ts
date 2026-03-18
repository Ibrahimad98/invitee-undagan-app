import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateEventDto {
  @ApiProperty()
  @IsString()
  eventName: string;

  @ApiProperty()
  @IsString()
  eventDate: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venueName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  venueAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mapUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class CreatePersonProfileDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentFather?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentMother?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  childOrder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  age?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class CreateGiftAccountDto {
  @ApiProperty()
  @IsString()
  bankName: string;

  @ApiProperty()
  @IsString()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  accountHolder: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

class CreateCoInvitorDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateInvitationDto {
  @ApiProperty({ example: 'Pernikahan Andi & Sari' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'pernikahan-andi-sari' })
  @IsString()
  @MinLength(3)
  slug: string;

  @ApiProperty({ enum: ['WEDDING', 'KHITANAN', 'BIRTHDAY', 'AQIQAH', 'ENGAGEMENT', 'GRADUATION', 'REUNION', 'CORPORATE', 'SYUKURAN', 'ANNIVERSARY', 'WALIMAH', 'CUSTOM'] })
  @IsEnum(['WEDDING', 'KHITANAN', 'BIRTHDAY', 'AQIQAH', 'ENGAGEMENT', 'GRADUATION', 'REUNION', 'CORPORATE', 'SYUKURAN', 'ANNIVERSARY', 'WALIMAH', 'CUSTOM'])
  eventType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  openingText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  closingText?: string;

  @ApiPropertyOptional({ description: 'Background story of the event (optional)' })
  @IsOptional()
  @IsString()
  story?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  musicUrl?: string;

  @ApiPropertyOptional({ type: [CreateEventDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventDto)
  events?: CreateEventDto[];

  @ApiPropertyOptional({ type: [CreatePersonProfileDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePersonProfileDto)
  personProfiles?: CreatePersonProfileDto[];

  @ApiPropertyOptional({ type: [CreateGiftAccountDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGiftAccountDto)
  giftAccounts?: CreateGiftAccountDto[];

  @ApiPropertyOptional({ type: [CreateCoInvitorDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCoInvitorDto)
  coInvitors?: CreateCoInvitorDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;
}
