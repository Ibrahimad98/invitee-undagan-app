import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateGuestDto } from './create-guest.dto';

class GuestItem {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsString()
  groupName?: string;
}

export class ImportGuestsDto {
  @ApiProperty()
  @IsString()
  invitationId: string;

  @ApiProperty({ type: [GuestItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestItem)
  guests: GuestItem[];
}
