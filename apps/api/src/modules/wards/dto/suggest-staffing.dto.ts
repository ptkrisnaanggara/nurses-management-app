import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

/** Patient census by Douglas care level, for the staffing calculator. */
export class SuggestStaffingDto {
  @ApiProperty({ description: 'Minimal-care patients' })
  @IsInt()
  @Min(0)
  MINIMAL: number;

  @ApiProperty({ description: 'Partial-care patients' })
  @IsInt()
  @Min(0)
  PARTIAL: number;

  @ApiProperty({ description: 'Total-care patients' })
  @IsInt()
  @Min(0)
  TOTAL: number;
}
