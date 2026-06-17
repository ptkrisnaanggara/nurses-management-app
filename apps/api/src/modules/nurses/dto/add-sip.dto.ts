import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, Length } from 'class-validator';

export class AddSipDto {
  @ApiProperty()
  @IsString()
  @Length(2, 100)
  sipNumber: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  workplace: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  issuedAt: string;

  @ApiProperty({ example: '2029-01-01' })
  @IsDateString()
  expiresAt: string;
}
