import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nurse } from './entities/nurse.entity';
import { SipLicense } from './entities/sip-license.entity';
import { NURSE_REPOSITORY } from './nurse.repository';
import { NurseTypeOrmRepository } from './nurse.typeorm.repository';
import { SIP_REPOSITORY } from './sip.repository';
import { SipTypeOrmRepository } from './sip.typeorm.repository';
import { NursesController } from './nurses.controller';
import { NursesService } from './nurses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Nurse, SipLicense])],
  controllers: [NursesController],
  providers: [
    NursesService,
    { provide: NURSE_REPOSITORY, useClass: NurseTypeOrmRepository },
    { provide: SIP_REPOSITORY, useClass: SipTypeOrmRepository },
  ],
  exports: [NursesService],
})
export class NursesModule {}
