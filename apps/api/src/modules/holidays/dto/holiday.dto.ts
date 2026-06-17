import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class HolidayDto {
  @ApiProperty({ example: '2026-08-17' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Hari Kemerdekaan' })
  @IsString()
  @Length(2, 200)
  name: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isCutiBersama?: boolean;
}

/** Bulk import of a year's SKB 3 Menteri calendar. */
export class ImportHolidaysDto {
  @ApiProperty({ type: [HolidayDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HolidayDto)
  holidays: HolidayDto[];
}
