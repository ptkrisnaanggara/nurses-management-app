import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { EmploymentClass, PkLevel } from '@nurses/shared';

export class CreateNurseDto {
  @ApiProperty()
  @IsUUID()
  facilityId: string;

  @ApiProperty({ example: 'Siti Rahmawati' })
  @IsString()
  @Length(2, 200)
  fullName: string;

  @ApiProperty({ enum: ['M', 'F'] })
  @IsIn(['M', 'F'])
  gender: 'M' | 'F';

  @ApiProperty({ example: '1995-04-12' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ enum: EmploymentClass })
  @IsOptional()
  @IsEnum(EmploymentClass)
  employmentClass?: EmploymentClass;

  @ApiPropertyOptional({ enum: PkLevel })
  @IsOptional()
  @IsEnum(PkLevel)
  pkLevel?: PkLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 100)
  strNumber?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skpCredits?: number;

  @ApiPropertyOptional({ default: 40 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  weeklyContractHours?: number;
}
