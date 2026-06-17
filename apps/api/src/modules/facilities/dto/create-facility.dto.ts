import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { WorkWeekScheme } from '@nurses/shared';

export class CreateFacilityDto {
  @ApiProperty({ example: 'RSUD Dr. Soetomo' })
  @IsString()
  @Length(2, 200)
  name: string;

  @ApiPropertyOptional({ example: 'Surabaya' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @ApiPropertyOptional({ enum: WorkWeekScheme, default: WorkWeekScheme.SIX_DAY })
  @IsOptional()
  @IsEnum(WorkWeekScheme)
  workWeekScheme?: WorkWeekScheme;

  @ApiPropertyOptional({ example: 'Asia/Jakarta', default: 'Asia/Jakarta' })
  @IsOptional()
  @IsString()
  @Length(2, 64)
  timeZone?: string;
}
