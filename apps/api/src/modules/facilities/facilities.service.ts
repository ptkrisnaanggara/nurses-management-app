import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { Facility } from './entities/facility.entity';
import {
  FACILITY_REPOSITORY,
  FacilityRepository,
} from './facility.repository';

/**
 * Business logic for facilities. Depends only on the FacilityRepository port,
 * keeping it free of persistence concerns and trivially unit-testable.
 */
@Injectable()
export class FacilitiesService {
  constructor(
    @Inject(FACILITY_REPOSITORY)
    private readonly facilities: FacilityRepository,
  ) {}

  create(dto: CreateFacilityDto): Promise<Facility> {
    return this.facilities.create(dto);
  }

  findAll(): Promise<Facility[]> {
    return this.facilities.findAll();
  }

  async findOne(id: string): Promise<Facility> {
    const facility = await this.facilities.findById(id);
    if (!facility) {
      throw new NotFoundException(`Facility ${id} not found`);
    }
    return facility;
  }

  async update(id: string, dto: UpdateFacilityDto): Promise<Facility> {
    const updated = await this.facilities.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Facility ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.facilities.remove(id);
    if (!removed) {
      throw new NotFoundException(`Facility ${id} not found`);
    }
  }
}
