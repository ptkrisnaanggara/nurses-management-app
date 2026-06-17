import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nurse } from './entities/nurse.entity';
import { NurseRepository } from './nurse.repository';

/** TypeORM adapter for the NurseRepository port. */
@Injectable()
export class NurseTypeOrmRepository implements NurseRepository {
  constructor(
    @InjectRepository(Nurse)
    private readonly repo: Repository<Nurse>,
  ) {}

  create(data: Partial<Nurse>): Promise<Nurse> {
    return this.repo.save(this.repo.create(data));
  }

  findByFacility(facilityId: string): Promise<Nurse[]> {
    return this.repo.find({ where: { facilityId }, order: { fullName: 'ASC' } });
  }

  findById(id: string): Promise<Nurse | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByIdWithSensitive(id: string): Promise<Nurse | null> {
    return this.repo
      .createQueryBuilder('nurse')
      .addSelect(['nurse.isPregnant', 'nurse.isLactating'])
      .leftJoinAndSelect('nurse.sipLicenses', 'sip')
      .where('nurse.id = :id', { id })
      .getOne();
  }

  findAllWithSensitive(): Promise<Nurse[]> {
    return this.repo
      .createQueryBuilder('nurse')
      .addSelect(['nurse.isPregnant', 'nurse.isLactating'])
      .where('nurse.active = true')
      .getMany();
  }

  findByFacilityWithSensitive(facilityId: string): Promise<Nurse[]> {
    return this.repo
      .createQueryBuilder('nurse')
      .addSelect(['nurse.isPregnant', 'nurse.isLactating'])
      .where('nurse.active = true')
      .andWhere('nurse.facilityId = :facilityId', { facilityId })
      .orderBy('nurse.fullName', 'ASC')
      .getMany();
  }

  async update(id: string, data: Partial<Nurse>): Promise<Nurse | null> {
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
