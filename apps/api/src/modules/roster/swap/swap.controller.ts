import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@nurses/shared';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtUser } from '../../auth/auth.types';
import { CreateSwapDto } from './dto/swap.dto';
import { SwapService } from './swap.service';

const APPROVERS: UserRole[] = [
  UserRole.ADMIN,
  UserRole.NURSING_MANAGER,
  UserRole.HEAD_NURSE,
];

@ApiTags('swaps')
@ApiBearerAuth()
@Controller('swaps')
export class SwapController {
  constructor(private readonly swaps: SwapService) {}

  @Post()
  create(@Body() dto: CreateSwapDto) {
    return this.swaps.create(
      dto.rosterPeriodId,
      dto.requesterAssignmentId,
      dto.targetAssignmentId,
    );
  }

  @Get('pending')
  @Roles(...APPROVERS)
  listPending() {
    return this.swaps.listPending();
  }

  @Get(':id/validate')
  validate(@Param('id', ParseUUIDPipe) id: string) {
    return this.swaps.validate(id);
  }

  @Post(':id/approve')
  @Roles(...APPROVERS)
  @HttpCode(HttpStatus.OK)
  approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.swaps.approve(id, user.sub);
  }

  @Post(':id/reject')
  @Roles(...APPROVERS)
  @HttpCode(HttpStatus.OK)
  reject(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.swaps.reject(id, user.sub);
  }
}
