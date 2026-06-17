import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { PkLevel, WardType } from '@nurses/shared';

class ShiftDemandDto {
  @ApiProperty() @IsInt() @Min(0) pagi: number;
  @ApiProperty() @IsInt() @Min(0) siang: number;
  @ApiProperty() @IsInt() @Min(0) malam: number;
}

export class CreateWardDto {
  @ApiProperty() @IsUUID() facilityId: string;

  @ApiProperty({ example: 'ICU Dewasa' })
  @IsString()
  @Length(2, 150)
  name: string;

  @ApiProperty({ enum: WardType }) @IsEnum(WardType) type: WardType;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  bedCount?: number;

  @ApiPropertyOptional({ type: ShiftDemandDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShiftDemandDto)
  shiftDemand?: ShiftDemandDto;

  @ApiPropertyOptional({ enum: PkLevel })
  @IsOptional()
  @IsEnum(PkLevel)
  minPkLevelOnShift?: PkLevel;
}

export class UpdateWardDto extends PartialType(CreateWardDto) {}
