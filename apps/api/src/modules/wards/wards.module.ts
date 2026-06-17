import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ward } from './entities/ward.entity';
import { WARD_REPOSITORY } from './ward.repository';
import { WardTypeOrmRepository } from './ward.typeorm.repository';
import { WardsController } from './wards.controller';
import { WardsService } from './wards.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ward])],
  controllers: [WardsController],
  providers: [
    WardsService,
    { provide: WARD_REPOSITORY, useClass: WardTypeOrmRepository },
  ],
  exports: [WardsService],
})
export class WardsModule {}
