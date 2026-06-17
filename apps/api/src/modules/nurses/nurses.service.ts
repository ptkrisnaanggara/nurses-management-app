import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NurseProfile } from '../rules/evaluation/types';
import { CreateNurseDto } from './dto/create-nurse.dto';
import { UpdateNurseDto } from './dto/update-nurse.dto';
import { AddSipDto } from './dto/add-sip.dto';
import { Nurse } from './entities/nurse.entity';
import { SipLicense } from './entities/sip-license.entity';
import {
  ComplianceAlert,
  checkCompliance,
} from './nurse-compliance';
import { NURSE_REPOSITORY, NurseRepository } from './nurse.repository';
import { SIP_REPOSITORY, SipRepository } from './sip.repository';

@Injectable()
export class NursesService {
  constructor(
    @Inject(NURSE_REPOSITORY) private readonly nurses: NurseRepository,
    @Inject(SIP_REPOSITORY) private readonly sips: SipRepository,
  ) {}

  create(dto: CreateNurseDto): Promise<Nurse> {
    return this.nurses.create(dto);
  }

  findByFacility(facilityId: string): Promise<Nurse[]> {
    return this.nurses.findByFacility(facilityId);
  }

  async findOne(id: string, includeSensitive = false): Promise<Nurse> {
    const nurse = includeSensitive
      ? await this.nurses.findByIdWithSensitive(id)
      : await this.nurses.findById(id);
    if (!nurse) throw new NotFoundException(`Nurse ${id} not found`);
    return nurse;
  }

  async update(id: string, dto: UpdateNurseDto): Promise<Nurse> {
    const updated = await this.nurses.update(id, dto);
    if (!updated) throw new NotFoundException(`Nurse ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    if (!(await this.nurses.remove(id))) {
      throw new NotFoundException(`Nurse ${id} not found`);
    }
  }

  async addSip(nurseId: string, dto: AddSipDto): Promise<SipLicense> {
    await this.findOne(nurseId);
    return this.sips.create({ ...dto, nurseId });
  }

  async compliance(nurseId: string): Promise<ComplianceAlert[]> {
    const nurse = await this.findOne(nurseId);
    const sips = await this.sips.findByNurse(nurseId);
    return checkCompliance(nurse, sips);
  }

  /** Adapts a persisted nurse to the rule engine's NurseProfile shape. */
  toRuleProfile(nurse: Nurse): NurseProfile {
    return {
      id: nurse.id,
      gender: nurse.gender,
      birthDate: nurse.birthDate,
      isPregnant: nurse.isPregnant,
      pkLevel: nurse.pkLevel ?? undefined,
      employmentClass: nurse.employmentClass,
      weeklyContractHours: nurse.weeklyContractHours,
    };
  }

  /** Scheduling profiles for every active nurse of a facility. */
  async profilesForFacility(facilityId: string): Promise<NurseProfile[]> {
    const nurses = await this.nurses.findByFacilityWithSensitive(facilityId);
    return nurses.map((n) => this.toRuleProfile(n));
  }
}
