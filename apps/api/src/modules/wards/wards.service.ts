import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWardDto, UpdateWardDto } from './dto/ward.dto';
import { Ward } from './entities/ward.entity';
import { WARD_REPOSITORY, WardRepository } from './ward.repository';
import { douglasDemand, PatientCensus } from './staffing/douglas';

@Injectable()
export class WardsService {
  constructor(
    @Inject(WARD_REPOSITORY) private readonly wards: WardRepository,
  ) {}

  create(dto: CreateWardDto): Promise<Ward> {
    return this.wards.create(dto);
  }

  findByFacility(facilityId: string): Promise<Ward[]> {
    return this.wards.findByFacility(facilityId);
  }

  async findOne(id: string): Promise<Ward> {
    const ward = await this.wards.findById(id);
    if (!ward) throw new NotFoundException(`Ward ${id} not found`);
    return ward;
  }

  async update(id: string, dto: UpdateWardDto): Promise<Ward> {
    const updated = await this.wards.update(id, dto);
    if (!updated) throw new NotFoundException(`Ward ${id} not found`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    if (!(await this.wards.remove(id))) {
      throw new NotFoundException(`Ward ${id} not found`);
    }
  }

  /** Suggest per-shift staffing from a patient census using the Douglas method. */
  suggestStaffing(census: PatientCensus) {
    const raw = douglasDemand(census);
    return {
      raw,
      rounded: {
        pagi: Math.ceil(raw.PAGI),
        siang: Math.ceil(raw.SIANG),
        malam: Math.ceil(raw.MALAM),
      },
    };
  }
}
