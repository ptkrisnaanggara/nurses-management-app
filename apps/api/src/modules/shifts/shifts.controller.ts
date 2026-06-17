import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@nurses/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateShiftDefinitionDto,
  UpdateShiftDefinitionDto,
} from './dto/shift-definition.dto';
import { ShiftsService } from './shifts.service';

@ApiTags('shifts')
@ApiBearerAuth()
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shifts: ShiftsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER)
  create(@Body() dto: CreateShiftDefinitionDto) {
    return this.shifts.create(dto);
  }

  @Get()
  findByFacility(@Query('facilityId', ParseUUIDPipe) facilityId: string) {
    return this.shifts.findByFacility(facilityId);
  }

  @Post('seed-defaults/:facilityId')
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER)
  seedDefaults(@Param('facilityId', ParseUUIDPipe) facilityId: string) {
    return this.shifts.seedDefaults(facilityId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShiftDefinitionDto,
  ) {
    return this.shifts.update(id, dto);
  }
}
