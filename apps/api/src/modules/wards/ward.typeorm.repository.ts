import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ward } from './entities/ward.entity';
import { WardRepository } from './ward.repository';

@Injectable()
export class WardTypeOrmRepository implements WardRepository {
  constructor(
    @InjectRepository(Ward) private readonly repo: Repository<Ward>,
  ) {}

  create(data: Partial<Ward>): Promise<Ward> {
    return this.repo.save(this.repo.create(data));
  }

  findByFacility(facilityId: string): Promise<Ward[]> {
    return this.repo.find({ where: { facilityId }, order: { name: 'ASC' } });
  }

  findById(id: string): Promise<Ward | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Ward>): Promise<Ward | null> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
