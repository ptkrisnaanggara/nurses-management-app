import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@nurses/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtUser } from '../auth/auth.types';
import { AddSipDto } from './dto/add-sip.dto';
import { CreateNurseDto } from './dto/create-nurse.dto';
import { UpdateNurseDto } from './dto/update-nurse.dto';
import { Nurse } from './entities/nurse.entity';
import { NursesService } from './nurses.service';

/** Roles allowed to see/set privacy-sensitive health flags. */
const HEALTH_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.NURSING_MANAGER];

@ApiTags('nurses')
@ApiBearerAuth()
@Controller('nurses')
export class NursesController {
  constructor(private readonly nurses: NursesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER)
  create(@Body() dto: CreateNurseDto) {
    return this.nurses.create(dto);
  }

  @Get()
  findByFacility(@Query('facilityId', ParseUUIDPipe) facilityId: string) {
    return this.nurses.findByFacility(facilityId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    const canSeeHealth = HEALTH_ROLES.includes(user.role);
    const nurse = await this.nurses.findOne(id, canSeeHealth);
    return this.view(nurse, canSeeHealth);
  }

  @Get(':id/compliance')
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER, UserRole.HEAD_NURSE, UserRole.HRD)
  compliance(@Param('id', ParseUUIDPipe) id: string) {
    return this.nurses.compliance(id);
  }

  @Post(':id/sip')
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER)
  addSip(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddSipDto) {
    return this.nurses.addSip(id, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER, UserRole.HEAD_NURSE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNurseDto,
    @CurrentUser() user: JwtUser,
  ) {
    // Only manager roles may change health flags.
    if (
      (dto.isPregnant !== undefined || dto.isLactating !== undefined) &&
      !HEALTH_ROLES.includes(user.role)
    ) {
      throw new ForbiddenException('Not allowed to modify health flags');
    }
    return this.nurses.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.nurses.remove(id);
  }

  /** Strips health flags for callers without the privilege. */
  private view(nurse: Nurse, includeHealth: boolean) {
    if (includeHealth) return nurse;
    const { isPregnant, isLactating, ...rest } = nurse;
    void isPregnant;
    void isLactating;
    return rest;
  }
}
