import { RosterPeriod } from './entities/roster-period.entity';
import { Assignment } from './entities/assignment.entity';

export interface RosterRepository {
  createPeriod(data: Partial<RosterPeriod>): Promise<RosterPeriod>;
  findPeriodById(id: string): Promise<RosterPeriod | null>;
  findPeriodsByWard(wardId: string): Promise<RosterPeriod[]>;
  updatePeriod(
    id: string,
    data: Partial<RosterPeriod>,
  ): Promise<RosterPeriod | null>;

  addAssignment(data: Partial<Assignment>): Promise<Assignment>;
  removeAssignment(id: string): Promise<boolean>;
  findAssignmentsByPeriod(rosterPeriodId: string): Promise<Assignment[]>;
  findAssignmentsByNurse(
    rosterPeriodId: string,
    nurseId: string,
  ): Promise<Assignment[]>;
}

export const ROSTER_REPOSITORY = Symbol('ROSTER_REPOSITORY');
