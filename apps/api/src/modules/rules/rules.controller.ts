import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@nurses/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { EvaluateAssignmentDto } from './dto/evaluate-assignment.dto';
import { RulesService } from './rules.service';

@ApiTags('rules')
@ApiBearerAuth()
@Controller('rules')
export class RulesController {
  constructor(private readonly rules: RulesService) {}

  @Get()
  findAll() {
    return this.rules.findAll();
  }

  /** Check a single proposed assignment against the resolved rule set. */
  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  evaluate(@Body() dto: EvaluateAssignmentDto) {
    return this.rules.evaluate(
      { facilityId: dto.facilityId, nurseId: dto.nurse.id },
      { nurse: dto.nurse, proposed: dto.proposed, existing: dto.existing },
    );
  }

  @Post('seed-defaults')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  seed() {
    return this.rules.seedDefaults();
  }
}
