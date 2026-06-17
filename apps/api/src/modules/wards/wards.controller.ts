import {
  Body,
  Controller,
  Delete,
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
import { CareLevel, UserRole } from '@nurses/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateWardDto, UpdateWardDto } from './dto/ward.dto';
import { SuggestStaffingDto } from './dto/suggest-staffing.dto';
import { WardsService } from './wards.service';

@ApiTags('wards')
@ApiBearerAuth()
@Controller('wards')
export class WardsController {
  constructor(private readonly wards: WardsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER)
  create(@Body() dto: CreateWardDto) {
    return this.wards.create(dto);
  }

  @Get()
  findByFacility(@Query('facilityId', ParseUUIDPipe) facilityId: string) {
    return this.wards.findByFacility(facilityId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.wards.findOne(id);
  }

  @Post('suggest-staffing')
  @HttpCode(HttpStatus.OK)
  suggestStaffing(@Body() dto: SuggestStaffingDto) {
    return this.wards.suggestStaffing({
      [CareLevel.MINIMAL]: dto.MINIMAL,
      [CareLevel.PARTIAL]: dto.PARTIAL,
      [CareLevel.TOTAL]: dto.TOTAL,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.NURSING_MANAGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWardDto,
  ) {
    return this.wards.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.wards.remove(id);
  }
}
