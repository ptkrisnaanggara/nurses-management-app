import { OmitType, PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateNurseDto } from './create-nurse.dto';

/**
 * Update DTO. `facilityId` is immutable here. Health flags are settable but
 * the controller restricts who may send them (privacy).
 */
export class UpdateNurseDto extends PartialType(
  OmitType(CreateNurseDto, ['facilityId'] as const),
) {
  @ApiPropertyOptional({ description: 'Restricted: requires manager role' })
  @IsOptional()
  @IsBoolean()
  isPregnant?: boolean;

  @ApiPropertyOptional({ description: 'Restricted: requires manager role' })
  @IsOptional()
  @IsBoolean()
  isLactating?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
