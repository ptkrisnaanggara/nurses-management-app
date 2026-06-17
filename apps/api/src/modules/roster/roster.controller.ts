import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@nurses/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { AddAssignmentDto, CreatePeriodDto } from './dto/roster.dto';
import { RosterService } from './roster.service';

const EDITORS: UserRole[] = [
  UserRole.ADMIN,
  UserRole.NURSING_MANAGER,
  UserRole.HEAD_NURSE,
];

@ApiTags('roster')
@ApiBearerAuth()
@Controller('roster')
export class RosterController {
  constructor(private readonly roster: RosterService) {}

  @Post('periods')
  @Roles(...EDITORS)
  createPeriod(@Body() dto: CreatePeriodDto) {
    return this.roster.createPeriod(dto);
  }

  @Get('periods')
  listByWard(@Query('wardId', ParseUUIDPipe) wardId: string) {
    return this.roster.listByWard(wardId);
  }

  @Get('periods/:id')
  getPeriod(@Param('id', ParseUUIDPipe) id: string) {
    return this.roster.getPeriod(id);
  }

  @Get('periods/:id/assignments')
  assignments(@Param('id', ParseUUIDPipe) id: string) {
    return this.roster.getAssignments(id);
  }

  @Get('periods/:id/validate')
  validate(@Param('id', ParseUUIDPipe) id: string) {
    return this.roster.validatePeriod(id);
  }

  @Post('periods/:id/assignments')
  @Roles(...EDITORS)
  addAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddAssignmentDto,
  ) {
    return this.roster.addAssignment(id, dto.nurseId, dto.date, dto.shiftType);
  }

  @Delete('assignments/:assignmentId')
  @Roles(...EDITORS)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAssignment(
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ) {
    await this.roster.removeAssignment(assignmentId);
  }

  @Post('periods/:id/publish')
  @Roles(...EDITORS)
  @HttpCode(HttpStatus.OK)
  publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.roster.publish(id);
  }

  @Post('periods/:id/lock')
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER)
  @HttpCode(HttpStatus.OK)
  lock(@Param('id', ParseUUIDPipe) id: string) {
    return this.roster.lock(id);
  }
}
