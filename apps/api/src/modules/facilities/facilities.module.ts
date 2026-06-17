import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facility } from './entities/facility.entity';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';
import { FACILITY_REPOSITORY } from './facility.repository';
import { FacilityTypeOrmRepository } from './facility.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Facility])],
  controllers: [FacilitiesController],
  providers: [
    FacilitiesService,
    // Bind the port to its TypeORM adapter (Dependency Inversion).
    { provide: FACILITY_REPOSITORY, useClass: FacilityTypeOrmRepository },
  ],
  exports: [FacilitiesService],
})
export class FacilitiesModule {}
