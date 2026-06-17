import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facility } from './entities/facility.entity';
import { FacilityRepository } from './facility.repository';

/** TypeORM-backed adapter implementing the FacilityRepository port. */
@Injectable()
export class FacilityTypeOrmRepository implements FacilityRepository {
  constructor(
    @InjectRepository(Facility)
    private readonly repo: Repository<Facility>,
  ) {}

  create(data: Partial<Facility>): Promise<Facility> {
    return this.repo.save(this.repo.create(data));
  }

  findAll(): Promise<Facility[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  findById(id: string): Promise<Facility | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Facility>): Promise<Facility | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
