import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { LeaveType } from '@nurses/shared';

export class CreateLeaveDto {
  @ApiProperty() @IsUUID() nurseId: string;

  @ApiProperty({ enum: LeaveType }) @IsEnum(LeaveType) type: LeaveType;

  @ApiProperty({ example: '2026-07-21' }) @IsDateString() startDate: string;

  @ApiProperty({ example: '2026-07-22' }) @IsDateString() endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
