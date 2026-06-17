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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/auth.types';
import { AuditService } from '../audit/audit.service';
import { NotFoundException } from '@nestjs/common';
import { AddAssignmentDto, CreatePeriodDto } from './dto/roster.dto';
import { RosterService } from './roster.service';
import { GenerationPublisher } from './generation/generation.publisher';
import { RosterJobStore } from './generation/roster-job.store';
import { AnalyticsService } from './analytics/analytics.service';

const EDITORS: UserRole[] = [
  UserRole.ADMIN,
  UserRole.NURSING_MANAGER,
  UserRole.HEAD_NURSE,
];

@ApiTags('roster')
@ApiBearerAuth()
@Controller('roster')
export class RosterController {
  constructor(
    private readonly roster: RosterService,
    private readonly generation: GenerationPublisher,
    private readonly jobs: RosterJobStore,
    private readonly analytics: AnalyticsService,
    private readonly audit: AuditService,
  ) {}

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

  @Get('periods/:id/fairness')
  fairness(@Param('id', ParseUUIDPipe) id: string) {
    return this.analytics.fairness(id);
  }

  @Get('periods/:id/night-compliance')
  nightCompliance(@Param('id', ParseUUIDPipe) id: string) {
    return this.analytics.nightCompliance(id);
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

  @Post('periods/:id/generate')
  @Roles(...EDITORS)
  @HttpCode(HttpStatus.ACCEPTED)
  async generate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    await this.roster.getPeriod(id); // 404 if missing
    const jobId = await this.generation.enqueue(id);
    await this.audit.record({
      userId: user.sub,
      action: 'ROSTER_GENERATE_ENQUEUED',
      entityType: 'RosterPeriod',
      entityId: id,
      metadata: { jobId },
    });
    return { jobId, status: 'PENDING' };
  }

  @Get('jobs/:jobId')
  async jobStatus(@Param('jobId', ParseUUIDPipe) jobId: string) {
    const job = await this.jobs.get(jobId);
    if (!job) throw new NotFoundException(`Job ${jobId} not found`);
    return job;
  }

  @Post('periods/:id/publish')
  @Roles(...EDITORS)
  @HttpCode(HttpStatus.OK)
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    const period = await this.roster.publish(id);
    await this.audit.record({
      userId: user.sub,
      action: 'ROSTER_PUBLISHED',
      entityType: 'RosterPeriod',
      entityId: id,
    });
    return period;
  }

  @Post('periods/:id/lock')
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER)
  @HttpCode(HttpStatus.OK)
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    const period = await this.roster.lock(id);
    await this.audit.record({
      userId: user.sub,
      action: 'ROSTER_LOCKED',
      entityType: 'RosterPeriod',
      entityId: id,
    });
    return period;
  }
}
