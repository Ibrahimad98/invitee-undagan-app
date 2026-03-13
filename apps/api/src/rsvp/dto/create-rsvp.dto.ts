import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRsvpDto {
  @ApiProperty()
  @IsString()
  invitationId: string;

  @ApiProperty()
  @IsString()
  guestName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ enum: ['ATTENDING', 'NOT_ATTENDING', 'MAYBE'] })
  @IsEnum(['ATTENDING', 'NOT_ATTENDING', 'MAYBE'])
  attendance: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numGuests?: number;
}
