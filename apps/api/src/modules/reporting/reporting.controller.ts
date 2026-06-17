import { Controller, Get, Header, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@nurses/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportingService } from './reporting.service';

@ApiTags('reporting')
@ApiBearerAuth()
@Controller('reporting')
export class ReportingController {
  constructor(private readonly reporting: ReportingService) {}

  @Get('periods/:id/overtime')
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER, UserRole.HRD)
  overtime(@Param('id', ParseUUIDPipe) id: string) {
    return this.reporting.overtimeReport(id);
  }

  @Get('periods/:id/roster.csv')
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER, UserRole.HRD, UserRole.HEAD_NURSE)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="roster.csv"')
  rosterCsv(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.reporting.rosterCsv(id);
  }
}
