import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@nurses/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtUser } from '../auth/auth.types';
import { CreateLeaveDto } from './dto/leave.dto';
import { LeaveService } from './leave.service';

const APPROVERS: UserRole[] = [
  UserRole.ADMIN,
  UserRole.NURSING_MANAGER,
  UserRole.HEAD_NURSE,
];

@ApiTags('leave')
@ApiBearerAuth()
@Controller('leave')
export class LeaveController {
  constructor(private readonly leave: LeaveService) {}

  @Post()
  create(@Body() dto: CreateLeaveDto) {
    return this.leave.create(dto);
  }

  @Get()
  listByNurse(@Query('nurseId', ParseUUIDPipe) nurseId: string) {
    return this.leave.listByNurse(nurseId);
  }

  @Get('pending')
  @Roles(...APPROVERS)
  listPending() {
    return this.leave.listPending();
  }

  @Post(':id/approve')
  @Roles(...APPROVERS)
  approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.leave.approve(id, user.sub);
  }

  @Post(':id/reject')
  @Roles(...APPROVERS)
  reject(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.leave.reject(id, user.sub);
  }

  @Post(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.leave.cancel(id);
  }
}
