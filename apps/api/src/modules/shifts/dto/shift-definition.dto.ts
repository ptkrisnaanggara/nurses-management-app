import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';
import { ShiftType } from '@nurses/shared';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateShiftDefinitionDto {
  @ApiProperty() @IsUUID() facilityId: string;

  @ApiProperty({ enum: ShiftType }) @IsEnum(ShiftType) shiftType: ShiftType;

  @ApiProperty({ example: '07:00' }) @Matches(HHMM) startTime: string;

  @ApiProperty({ example: '14:00' }) @Matches(HHMM) endTime: string;

  @ApiPropertyOptional({ example: '11:00' })
  @IsOptional()
  @Matches(HHMM)
  breakStart?: string;

  @ApiPropertyOptional({ example: '12:00' })
  @IsOptional()
  @Matches(HHMM)
  breakEnd?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateShiftDefinitionDto extends PartialType(
  CreateShiftDefinitionDto,
) {}
