import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ShiftType } from '@nurses/shared';

export class AssignmentDto {
  @ApiProperty()
  @IsString()
  nurseId: string;

  @ApiProperty({ example: '2026-06-20' })
  @IsString()
  date: string;

  @ApiProperty({ enum: ShiftType })
  @IsEnum(ShiftType)
  shiftType: ShiftType;

  @ApiProperty({ example: '2026-06-20T21:00:00Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2026-06-21T07:00:00Z' })
  @IsDateString()
  endsAt: string;
}

export class NurseProfileDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ enum: ['M', 'F'] })
  @IsIn(['M', 'F'])
  gender: 'M' | 'F';

  @ApiPropertyOptional({ example: '2009-01-01' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPregnant?: boolean;
}

export class EvaluateAssignmentDto {
  @ApiPropertyOptional({ description: 'Scope context for rule resolution' })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @ApiProperty({ type: NurseProfileDto })
  @ValidateNested()
  @Type(() => NurseProfileDto)
  nurse: NurseProfileDto;

  @ApiProperty({ type: AssignmentDto })
  @ValidateNested()
  @Type(() => AssignmentDto)
  proposed: AssignmentDto;

  @ApiProperty({ type: [AssignmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentDto)
  existing: AssignmentDto[];
}
