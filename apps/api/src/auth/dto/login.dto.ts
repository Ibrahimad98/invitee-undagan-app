import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'demo@invitee.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'demo123' })
  @IsString()
  password: string;
}
