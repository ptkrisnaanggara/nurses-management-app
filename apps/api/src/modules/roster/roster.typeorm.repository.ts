import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RosterPeriod } from './entities/roster-period.entity';
import { Assignment } from './entities/assignment.entity';
import { RosterRepository } from './roster.repository';

@Injectable()
export class RosterTypeOrmRepository implements RosterRepository {
  constructor(
    @InjectRepository(RosterPeriod)
    private readonly periods: Repository<RosterPeriod>,
    @InjectRepository(Assignment)
    private readonly assignments: Repository<Assignment>,
  ) {}

  createPeriod(data: Partial<RosterPeriod>): Promise<RosterPeriod> {
    return this.periods.save(this.periods.create(data));
  }

  findPeriodById(id: string): Promise<RosterPeriod | null> {
    return this.periods.findOne({ where: { id } });
  }

  findPeriodsByWard(wardId: string): Promise<RosterPeriod[]> {
    return this.periods.find({
      where: { wardId },
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  async updatePeriod(
    id: string,
    data: Partial<RosterPeriod>,
  ): Promise<RosterPeriod | null> {
    const existing = await this.periods.findOne({ where: { id } });
    if (!existing) return null;
    Object.assign(existing, data);
    return this.periods.save(existing);
  }

  addAssignment(data: Partial<Assignment>): Promise<Assignment> {
    return this.assignments.save(this.assignments.create(data));
  }

  async removeAssignment(id: string): Promise<boolean> {
    const result = await this.assignments.delete(id);
    return (result.affected ?? 0) > 0;
  }

  findAssignmentById(id: string): Promise<Assignment | null> {
    return this.assignments.findOne({ where: { id } });
  }

  async updateAssignment(
    id: string,
    data: Partial<Assignment>,
  ): Promise<Assignment | null> {
    const existing = await this.assignments.findOne({ where: { id } });
    if (!existing) return null;
    Object.assign(existing, data);
    return this.assignments.save(existing);
  }

  findAssignmentsByPeriod(rosterPeriodId: string): Promise<Assignment[]> {
    return this.assignments.find({
      where: { rosterPeriodId },
      order: { date: 'ASC' },
    });
  }

  findAssignmentsByNurse(
    rosterPeriodId: string,
    nurseId: string,
  ): Promise<Assignment[]> {
    return this.assignments.find({
      where: { rosterPeriodId, nurseId },
      order: { date: 'ASC' },
    });
  }
}
