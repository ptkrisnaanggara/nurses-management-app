import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateSwapDto {
  @ApiProperty() @IsUUID() rosterPeriodId: string;
  @ApiProperty() @IsUUID() requesterAssignmentId: string;
  @ApiProperty() @IsUUID() targetAssignmentId: string;
}
