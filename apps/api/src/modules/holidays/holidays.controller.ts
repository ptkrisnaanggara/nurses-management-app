import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@nurses/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { ImportHolidaysDto } from './dto/holiday.dto';
import { HolidaysService } from './holidays.service';

@ApiTags('holidays')
@ApiBearerAuth()
@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidays: HolidaysService) {}

  @Get()
  findByYear(@Query('year', ParseIntPipe) year: number) {
    return this.holidays.findByYear(year);
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  import(@Body() dto: ImportHolidaysDto) {
    return this.holidays.import(dto.holidays);
  }
}
