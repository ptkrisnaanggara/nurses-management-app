import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ShiftType } from '@nurses/shared';

export class CreatePeriodDto {
  @ApiProperty() @IsUUID() facilityId: string;
  @ApiProperty() @IsUUID() wardId: string;
  @ApiProperty({ example: 2026 }) @IsInt() @Min(2020) @Max(2100) year: number;
  @ApiProperty({ example: 7 }) @IsInt() @Min(1) @Max(12) month: number;
}

export class AddAssignmentDto {
  @ApiProperty() @IsUUID() nurseId: string;
  @ApiProperty({ example: '2026-07-20' }) @IsDateString() date: string;
  @ApiProperty({ enum: ShiftType }) @IsEnum(ShiftType) shiftType: ShiftType;
}
